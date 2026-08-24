<#
  Tiny static file server for local preview — no Node, no Python needed.

      powershell -ExecutionPolicy Bypass -File serve.ps1
      then open http://localhost:5176/

  Ctrl+C to stop.

  Same shape as the one in baba-realty; only the port and the banner differ, so
  both sites can be previewed side by side without a port clash.
#>
# Port precedence: an explicit -Port wins, then the PORT environment variable
# (which is how the preview harness assigns a free port when several sites are
# being served at once), then the original default for a plain manual run.
param(
  [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 5176 }),
  [string]$Root = $PSScriptRoot
)

$Root = (Resolve-Path $Root).Path

$mime = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'
  '.css' ='text/css; charset=utf-8';  '.js' ='text/javascript; charset=utf-8'
  '.svg' ='image/svg+xml';            '.json'='application/json; charset=utf-8'
  '.png' ='image/png';                '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'
  '.webp'='image/webp';               '.gif'='image/gif';  '.ico'='image/x-icon'
  '.woff'='font/woff';                '.woff2'='font/woff2'; '.ttf'='font/ttf'
  '.txt' ='text/plain; charset=utf-8'; '.md'='text/markdown; charset=utf-8'
  '.xml' ='application/xml; charset=utf-8'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "DENTAL EXPERTS site serving $Root" -ForegroundColor DarkGray
Write-Host "  ->  http://localhost:$Port/" -ForegroundColor Yellow

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.NoDelay = $true

      # speculative/preconnect socket with nothing to say — drop it and move on
      if (-not $client.Client.Poll(400000, [System.Net.Sockets.SelectMode]::SelectRead)) {
        continue
      }

      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)

      $line = $reader.ReadLine()
      if (-not $line) { continue }
      while ($reader.Peek() -ge 0) { if ([string]::IsNullOrEmpty($reader.ReadLine())) { break } }

      $parts   = $line -split ' '
      $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $rawPath = ($rawPath -split '\?')[0]

      $rel = [System.Uri]::UnescapeDataString($rawPath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
      $rel = $rel -replace '/', '\'

      $full = Join-Path $Root $rel
      try { $full = [System.IO.Path]::GetFullPath($full) } catch { $full = '' }

      $body = $null; $status = '200 OK'; $type = 'text/plain; charset=utf-8'

      if ($full -and $full.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
        if (Test-Path $full -PathType Container) { $full = Join-Path $full 'index.html' }
        if (Test-Path $full -PathType Leaf) {
          $body = [System.IO.File]::ReadAllBytes($full)
          $ext  = [System.IO.Path]::GetExtension($full).ToLower()
          $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        }
      }

      if ($null -eq $body) {
        $status = '404 Not Found'; $type = 'text/html; charset=utf-8'
        $body = [System.Text.Encoding]::UTF8.GetBytes('<h1>404</h1>')
      }

      # NOTHING is cached by this server, images included.
      #
      # This used to send max-age=604800 for /assets/img/* on the theory that
      # images don't change while you work. They do: swap a photo for a better
      # one and the browser keeps showing the old file for a week, and requesting
      # an image before you've saved it pins the 404 for just as long. Both
      # failures look like "my edit did nothing", which is the worst possible
      # thing for a preview server to imply.
      #
      # Revalidating on localhost costs microseconds. Correctness wins.
      $cache = 'no-cache, no-store, must-revalidate'

      $head = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: $cache`r`nConnection: close`r`n`r`n"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($head)

      # single write — don't split headers and body across two packets
      $packet = New-Object byte[] ($hb.Length + $body.Length)
      [Array]::Copy($hb, 0, $packet, 0, $hb.Length)
      [Array]::Copy($body, 0, $packet, $hb.Length, $body.Length)
      $stream.Write($packet, 0, $packet.Length)
      $stream.Flush()

      Write-Host ("{0}  {1}" -f $status.Substring(0,3), $rawPath)
    } catch {
      Write-Host "err: $_" -ForegroundColor DarkRed
    } finally {
      try { $client.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
