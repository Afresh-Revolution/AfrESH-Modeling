# Regenerate PWA / favicon PNGs from public/brand-logo.png (same asset as nav & footer).
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$src = Join-Path $root "public\brand-logo.png"
$iconsDir = Join-Path $root "public\icons"
$bg = [System.Drawing.Color]::FromArgb(255, 11, 11, 13)

function Save-ScaledIcon($size, $dest, $maskable) {
  $srcImg = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear($bg)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  if ($maskable) {
    $inner = [int]($size * 0.72)
    $x = ($size - $inner) / 2
    $g.DrawImage($srcImg, $x, $x, $inner, $inner)
  } else {
    $g.DrawImage($srcImg, 0, 0, $size, $size)
  }

  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $srcImg.Dispose()
  Write-Host "Wrote $dest"
}

if (-not (Test-Path $src)) {
  throw "Missing $src - add brand-logo.png first."
}

New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
Save-ScaledIcon 192 (Join-Path $iconsDir "icon-192.png") $false
Save-ScaledIcon 512 (Join-Path $iconsDir "icon-512.png") $false
Save-ScaledIcon 512 (Join-Path $iconsDir "icon-512-maskable.png") $true
Save-ScaledIcon 180 (Join-Path $root "public\apple-touch-icon.png") $false
Copy-Item $src (Join-Path $root "public\pwa-logo.png") -Force
Write-Host "Done - PWA icons match brand-logo.png"
