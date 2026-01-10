# PowerShell Script: Refine Hero Logo (Location-Based Cleaning)
Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\mouha\DigitalCardinal-Modern-Clean\assets\images\hero-logo-transparent.png"
# No backup in script, we assume file is already restored to the "dirty but complete" state before running.

if (-not (Test-Path $sourcePath)) { Write-Host "Error: Source not found"; exit 1 }

$bmp = [System.Drawing.Bitmap]::FromFile($sourcePath)
$width = $bmp.Width
$height = $bmp.Height
Write-Host "Loaded $width x $height"

# Visited array
$visited = New-Object bool[] ($width * $height)
$components = @()

# Connectivity BFS
$dx = @(0, 0, 1, -1); $dy = @(1, -1, 0, 0)

Write-Host "Analyzing components..."

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $idx = $y * $width + $x
        if ($visited[$idx]) { continue }
        
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 10) {
            # Found new component
            $component = New-Object System.Collections.ArrayList
            $stack = New-Object System.Collections.Generic.Stack[int]
            $stack.Push($idx)
            $visited[$idx] = $true
            
            # Tracking component bounds/centroid
            $minX = $x; $maxX = $x
            
            while ($stack.Count -gt 0) {
                $cIdx = $stack.Pop()
                [void]$component.Add($cIdx)
                
                $cy = [Math]::Floor($cIdx / $width)
                $cx = $cIdx % $width
                
                if ($cx -lt $minX) { $minX = $cx }
                if ($cx -gt $maxX) { $maxX = $cx }
                
                for ($i = 0; $i -lt 4; $i++) {
                    $nx = $cx + $dx[$i]
                    $ny = $cy + $dy[$i]
                    if ($nx -ge 0 -and $nx -lt $width -and $ny -ge 0 -and $ny -lt $height) {
                        $nIdx = $ny * $width + $nx
                        if (-not $visited[$nIdx]) {
                            $np = $bmp.GetPixel($nx, $ny)
                            if ($np.A -gt 10) {
                                $visited[$nIdx] = $true
                                $stack.Push($nIdx)
                            }
                        }
                    }
                }
            }
            
            # Store component data
            $components += New-Object PSObject -Property @{
                Pixels = $component
                MinX = $minX
                MaxX = $maxX
                CenterX = ($minX + $maxX) / 2
                Count = $component.Count
            }
        }
    }
}

Write-Host "Found $($components.Count) components."

# FILTERING STRATEGY:
# Defect is on the Left. The cardinal is Centered.
# We remove components where CenterX is in the left 20% of the image.
# We KEEP everything else (to preserve floating beak/eyes).

$thresholdX = $width * 0.20
Write-Host "Removing components entirely to the left of X=$thresholdX"

$cleanBmp = $bmp.Clone()

foreach ($comp in $components) {
    # If the component is mostly on the left side
    if ($comp.MaxX -lt $thresholdX) {
        Write-Host "Removing left-side artifact (Count: $($comp.Count), MaxX: $($comp.MaxX))"
        foreach ($pxIdx in $comp.Pixels) {
            $py = [Math]::Floor($pxIdx / $width)
            $px = $pxIdx % $width
            $cleanBmp.SetPixel($px, $py, [System.Drawing.Color]::Transparent)
        }
    }
}

$bmp.Dispose()

# Save via Temp to avoid locking
$tempPath = $sourcePath + ".tmp.png"
$cleanBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cleanBmp.Dispose()

Move-Item -Path $tempPath -Destination $sourcePath -Force
Write-Host "Done. Cleaned image saved."
