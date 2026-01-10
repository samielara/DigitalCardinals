Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\mouha\.gemini\antigravity\brain\ce141874-af76-4561-b7da-46d9050ad431\uploaded_image_1768068286937.png"
$destDir = "c:\Users\mouha\DigitalCardinal-Modern-Clean\"

if (-not (Test-Path $sourcePath)) {
    Write-Host "Source image not found"
    exit 1
}

# 1. Processing Transparency & Bounding Box
Write-Host "Processing image..."
$bmp = [System.Drawing.Bitmap]::FromFile($sourcePath)
$width = $bmp.Width
$height = $bmp.Height

# Create working copy
$workBmp = New-Object System.Drawing.Bitmap $width, $height, $bmp.PixelFormat
$g = [System.Drawing.Graphics]::FromImage($workBmp)
$g.DrawImage($bmp, 0, 0, $width, $height)
$g.Dispose()
$bmp.Dispose()

$minX = $width
$minY = $height
$maxX = 0
$maxY = 0
$hasContent = $false

$threshold = 20 

# Scan for transparency AND content bounds
for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $pixel = $workBmp.GetPixel($x, $y)
        
        # Check if "black" -> make transparent
        if ($pixel.R -lt $threshold -and $pixel.G -lt $threshold -and $pixel.B -lt $threshold) {
             $workBmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
             # It's content, update bounds
             if ($x -lt $minX) { $minX = $x }
             if ($x -gt $maxX) { $maxX = $x }
             if ($y -lt $minY) { $minY = $y }
             if ($y -gt $maxY) { $maxY = $y }
             $hasContent = $true
        }
    }
}

if (-not $hasContent) {
    Write-Host "Error: No content found (image is all black/transparent?)"
    exit 1
}

# Crop to content
$cropWidth = $maxX - $minX + 1
$cropHeight = $maxY - $minY + 1
$cropRect = New-Object System.Drawing.Rectangle $minX, $minY, $cropWidth, $cropHeight
$croppedBmp = $workBmp.Clone($cropRect, $workBmp.PixelFormat)
$workBmp.Dispose()

Write-Host "Cropped to content: ${cropWidth}x${cropHeight}"

# 2. Resizing with Maximize fit
function Resize-Maximized {
    param([System.Drawing.Bitmap]$img, [int]$size, [string]$outName)
    
    try {
        # Calculate aspect ratio to fit in $size x $size
        $ratio = [Math]::Min($size / $img.Width, $size / $img.Height)
        $newW = [int]($img.Width * $ratio)
        $newH = [int]($img.Height * $ratio)
        
        # Center position
        $posX = [int](($size - $newW) / 2)
        $posY = [int](($size - $newH) / 2)
        
        $res = new-object System.Drawing.Bitmap $size, $size
        $graph = [System.Drawing.Graphics]::FromImage($res)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        # Draw centered and scaled
        $graph.DrawImage($img, $posX, $posY, $newW, $newH)
        
        $outPath = Join-Path $destDir $outName
        $res.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $res.Dispose()
        $graph.Dispose()
        Write-Host "Regenerated (Maximized) $outName"
    } catch {
        Write-Host "Error resizing $outName : $_"
    }
}

Resize-Maximized $croppedBmp 32 "favicon-32x32.png"
Resize-Maximized $croppedBmp 16 "favicon-16x16.png"
Resize-Maximized $croppedBmp 180 "apple-touch-icon.png"
Resize-Maximized $croppedBmp 192 "android-chrome-192x192.png"
Resize-Maximized $croppedBmp 512 "android-chrome-512x512.png"

# Copy 32x32 png to favicon.ico
Copy-Item (Join-Path $destDir "favicon-32x32.png") (Join-Path $destDir "favicon.ico") -Force
Write-Host "Regenerated favicon.ico"

$croppedBmp.Dispose()
