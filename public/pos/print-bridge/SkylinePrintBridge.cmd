<# : Skyline Print Bridge - batch + PowerShell in one file
@echo off
setlocal
title Skyline Print Bridge
set "SPB_SELF=%~f0"
set "SPB_ARG=%~1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ([IO.File]::ReadAllText($env:SPB_SELF))"
echo.
pause
exit /b
: end of batch part #>

# Skyline Print Bridge
# Lets the Skyline POS web page send raw ESC/POS bytes to a printer that Windows already
# drives (e.g. iWare DM-76H over USB). Browsers cannot open a USB printer that the Windows
# driver holds, so the page POSTs the bytes here and we hand them to the spooler as RAW.
#
#   Double-click            install: copy to %LOCALAPPDATA%\SkylinePrintBridge, autostart, start now
#   SkylinePrintBridge.cmd uninstall   stop it and remove the autostart entry
#
# Listens on 127.0.0.1:9123 only (never on the network).
#   GET  /status                  -> { ok, version, printers[], suggested }
#   POST /print?printer=<name>    body = raw ESC/POS bytes

$ErrorActionPreference = 'Stop'
$BridgeVersion = '1.0.0'
$BridgePort = 9123
$InstallDir = Join-Path $env:LOCALAPPDATA 'SkylinePrintBridge'
$InstalledScript = Join-Path $InstallDir 'bridge.ps1'
$ShortcutPath = Join-Path ([Environment]::GetFolderPath('Startup')) 'Skyline Print Bridge.lnk'
# Pages allowed to print. Any other website gets 403, so it cannot print or open the cash drawer.
$AllowedOrigins = @('https://skylinemoneychanger.com', 'https://www.skylinemoneychanger.com')
$ReceiptPrinterPattern = 'DM-?76|iware|TM-U|POS|receipt|struk|kasir|thermal|Generic / Text'
$MaxBodyBytes = 1MB

Add-Type -AssemblyName System.Drawing

function Get-PrinterNames { @([System.Drawing.Printing.PrinterSettings]::InstalledPrinters) }

function Get-SuggestedPrinter {
  [string](Get-PrinterNames | Where-Object { $_ -match $ReceiptPrinterPattern } | Select-Object -First 1)
}

function Test-AllowedOrigin([string]$origin) {
  # Local tools (curl, PowerShell) send no Origin; they can reach the spooler directly anyway
  if (-not $origin) { return $true }
  if ($AllowedOrigins -contains $origin) { return $true }
  return $origin -match '^http://(localhost|127\.0\.0\.1)(:\d+)?$'
}

# ---------------------------------------------------------------- server

function Write-Log([string]$msg) {
  try {
    if ((Test-Path $script:LogFile) -and (Get-Item $script:LogFile).Length -gt 1MB) { Remove-Item $script:LogFile -Force }
    Add-Content -Path $script:LogFile -Value ('{0:yyyy-MM-dd HH:mm:ss} {1}' -f (Get-Date), $msg)
  } catch {}
}

function Read-Request($stream) {
  $head = New-Object System.Collections.Generic.List[byte]
  while ($true) {
    $b = $stream.ReadByte()
    if ($b -lt 0) { return $null }
    $head.Add([byte]$b)
    $n = $head.Count
    if ($n -ge 4 -and $head[$n - 4] -eq 13 -and $head[$n - 3] -eq 10 -and $head[$n - 2] -eq 13 -and $head[$n - 1] -eq 10) { break }
    if ($n -gt 16384) { throw 'Header terlalu besar' }
  }
  $lines = [Text.Encoding]::ASCII.GetString($head.ToArray()) -split "`r`n"
  $first = $lines[0] -split ' '
  $headers = @{}
  foreach ($line in $lines | Select-Object -Skip 1) {
    $i = $line.IndexOf(':')
    if ($i -gt 0) { $headers[$line.Substring(0, $i).Trim().ToLower()] = $line.Substring($i + 1).Trim() }
  }
  $target = $first[1] -split '\?', 2
  $query = @{}
  if ($target.Count -gt 1) {
    foreach ($pair in $target[1] -split '&') {
      $kv = $pair -split '=', 2
      if ($kv[0]) { $query[[Uri]::UnescapeDataString($kv[0])] = if ($kv.Count -gt 1) { [Uri]::UnescapeDataString($kv[1].Replace('+', ' ')) } else { '' } }
    }
  }
  $len = 0
  if ($headers.ContainsKey('content-length')) { $len = [int]$headers['content-length'] }
  if ($len -gt $MaxBodyBytes) { throw 'Data cetak terlalu besar' }
  $body = New-Object byte[] $len
  $read = 0
  while ($read -lt $len) {
    $r = $stream.Read($body, $read, $len - $read)
    if ($r -le 0) { break }
    $read += $r
  }
  [pscustomobject]@{ Method = $first[0]; Path = $target[0]; Query = $query; Headers = $headers; Body = $body }
}

function Send-Response($stream, [int]$code, $obj, [string]$origin) {
  $reasons = @{ 200 = 'OK'; 204 = 'No Content'; 400 = 'Bad Request'; 403 = 'Forbidden'; 404 = 'Not Found'; 500 = 'Internal Server Error' }
  $body = [byte[]]@()
  if ($null -ne $obj) { $body = [Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Compress -Depth 4)) }
  $h = "HTTP/1.1 $code $($reasons[$code])`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n"
  if ($origin -and (Test-AllowedOrigin $origin)) {
    # Allow-Private-Network answers Chrome's preflight for a public site calling 127.0.0.1
    $h += "Access-Control-Allow-Origin: $origin`r`nVary: Origin`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Max-Age: 600`r`n"
  }
  $hb = [Text.Encoding]::ASCII.GetBytes($h + "`r`n")
  $stream.Write($hb, 0, $hb.Length)
  if ($body.Length) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}

function Invoke-Client($client) {
  $stream = $client.GetStream()
  # Short timeout: an idle pre-connect from the browser must not hold up the next print job
  $stream.ReadTimeout = 2000
  $stream.WriteTimeout = 5000
  $req = Read-Request $stream
  if (-not $req) { return }
  $origin = $req.Headers['origin']

  if ($req.Method -eq 'OPTIONS') { Send-Response $stream 204 $null $origin; return }
  if (-not (Test-AllowedOrigin $origin)) {
    Write-Log "403 origin $origin"
    Send-Response $stream 403 @{ ok = $false; error = 'Origin tidak diizinkan' } $null
    return
  }

  switch ("$($req.Method) $($req.Path)") {
    'GET /status' {
      Send-Response $stream 200 @{ ok = $true; app = 'skyline-print-bridge'; version = $BridgeVersion; printers = @(Get-PrinterNames); suggested = (Get-SuggestedPrinter) } $origin
    }
    'POST /print' {
      $name = $req.Query['printer']
      if (-not $name) { $name = Get-SuggestedPrinter }
      if (-not $name) {
        Send-Response $stream 400 @{ ok = $false; error = 'Printer belum dipilih. Pilih printer di Pengaturan POS.' } $origin
      } elseif (@(Get-PrinterNames) -notcontains $name) {
        Send-Response $stream 400 @{ ok = $false; error = "Printer '$name' tidak ada di Windows" } $origin
      } elseif ($req.Body.Length -eq 0) {
        Send-Response $stream 400 @{ ok = $false; error = 'Data cetak kosong' } $origin
      } else {
        try {
          [SkylineRawPrinter]::Send($name, $req.Body)
          Write-Log "print '$name' $($req.Body.Length) bytes"
          Send-Response $stream 200 @{ ok = $true; printer = $name; bytes = $req.Body.Length } $origin
        } catch {
          $msg = $_.Exception.GetBaseException().Message
          Write-Log "print '$name' failed: $msg"
          Send-Response $stream 500 @{ ok = $false; error = $msg } $origin
        }
      }
    }
    default { Send-Response $stream 404 @{ ok = $false; error = 'Not found' } $origin }
  }
}

function Start-Bridge {
  Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;

public static class SkylineRawPrinter {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DOCINFO { public string pDocName; public string pOutputFile; public string pDataType; }

  [DllImport("winspool.drv", SetLastError = true, CharSet = CharSet.Unicode)] static extern bool OpenPrinter(string name, out IntPtr handle, IntPtr defaults);
  [DllImport("winspool.drv", SetLastError = true)] static extern bool ClosePrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true, CharSet = CharSet.Unicode)] static extern int StartDocPrinter(IntPtr handle, int level, [In] DOCINFO info);
  [DllImport("winspool.drv", SetLastError = true)] static extern bool EndDocPrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true)] static extern bool StartPagePrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true)] static extern bool EndPagePrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true)] static extern bool WritePrinter(IntPtr handle, byte[] data, int count, out int written);

  static Exception Fail(string step) { return Fail(step, Marshal.GetLastWin32Error()); }
  static Exception Fail(string step, int code) { return new Win32Exception(code, step + ": " + new Win32Exception(code).Message); }

  // RAW data type: the spooler passes the bytes to the port untouched, so ESC/POS commands reach the printer
  public static void Send(string printer, byte[] data) {
    IntPtr h;
    if (!OpenPrinter(printer, out h, IntPtr.Zero)) throw Fail("OpenPrinter");
    try {
      DOCINFO info = new DOCINFO();
      info.pDocName = "Skyline POS Receipt";
      info.pDataType = "RAW";
      if (StartDocPrinter(h, 1, info) == 0) throw Fail("StartDocPrinter");
      try {
        if (!StartPagePrinter(h)) throw Fail("StartPagePrinter");
        int written;
        bool ok = WritePrinter(h, data, data.Length, out written);
        int code = Marshal.GetLastWin32Error();
        EndPagePrinter(h);
        if (!ok || written != data.Length) throw Fail("WritePrinter", code);
      } finally {
        EndDocPrinter(h);
      }
    } finally {
      ClosePrinter(h);
    }
  }
}
'@

  $script:LogFile = Join-Path $PSScriptRoot 'bridge.log'
  $listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $BridgePort
  try { $listener.Start() } catch {
    Write-Log "port $BridgePort sudah dipakai, bridge lain mungkin sudah jalan: $($_.Exception.Message)"
    return
  }
  Write-Log "Skyline Print Bridge $BridgeVersion listening on 127.0.0.1:$BridgePort"
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try { Invoke-Client $client } catch { Write-Log "error: $($_.Exception.GetBaseException().Message)" } finally { $client.Close() }
  }
}

# ---------------------------------------------------------------- install

function Stop-Bridge {
  Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" |
    Where-Object { $_.CommandLine -like '*SkylinePrintBridge*bridge.ps1*-Serve*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

function Install-Bridge {
  Write-Host ''
  Write-Host '  Skyline Print Bridge - pemasangan' -ForegroundColor Cyan
  Write-Host '  ---------------------------------'
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Stop-Bridge
  Start-Sleep -Milliseconds 500
  Copy-Item -LiteralPath $env:SPB_SELF -Destination $InstalledScript -Force
  Unblock-File -LiteralPath $InstalledScript -ErrorAction SilentlyContinue

  $powershellExe = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
  $arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$InstalledScript`" -Serve"
  $shell = New-Object -ComObject WScript.Shell
  $link = $shell.CreateShortcut($ShortcutPath)
  $link.TargetPath = $powershellExe
  $link.Arguments = $arguments
  $link.WindowStyle = 7
  $link.Description = 'Skyline POS: kirim struk ESC/POS ke printer Windows'
  $link.Save()

  Start-Process -FilePath $powershellExe -ArgumentList $arguments -WindowStyle Hidden
  Write-Host '  Menjalankan bridge...'
  $status = $null
  for ($i = 0; $i -lt 10 -and -not $status; $i++) {
    Start-Sleep -Milliseconds 700
    try { $status = Invoke-RestMethod -Uri "http://127.0.0.1:$BridgePort/status" -TimeoutSec 3 } catch {}
  }
  if (-not $status) {
    Write-Host '  GAGAL: bridge tidak merespons. Lihat bridge.log di:' -ForegroundColor Red
    Write-Host "  $InstallDir"
    return
  }

  Write-Host "  OK: bridge v$($status.version) aktif di http://127.0.0.1:$BridgePort" -ForegroundColor Green
  Write-Host '  Jalan otomatis setiap Windows menyala.'
  Write-Host ''
  Write-Host '  Printer di Windows:'
  foreach ($p in $status.printers) {
    $mark = if ($p -eq $status.suggested) { '  <- printer struk' } else { '' }
    Write-Host "   - $p$mark"
  }
  if (-not $status.suggested) {
    Write-Host '  Printer struk tidak terdeteksi otomatis. Pilih manual di POS > Pengaturan.' -ForegroundColor Yellow
  }
  Write-Host ''
  Write-Host '  Selanjutnya: buka POS > Pengaturan > Printer, klik "Cek koneksi" lalu "Tes cetak".'
}

function Uninstall-Bridge {
  Stop-Bridge
  Remove-Item -LiteralPath $ShortcutPath -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host '  Skyline Print Bridge dihapus.' -ForegroundColor Green
}

if ($args -contains '-Serve') { Start-Bridge }
elseif ($env:SPB_ARG -eq 'uninstall') { Uninstall-Bridge }
else { Install-Bridge }
