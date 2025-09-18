# PowerShell script to convert JPG to WebP
# This script uses System.Drawing to load the image and save it in a more compressed format

Add-Type -AssemblyName System.Drawing

$inputPath = "C:\Users\negar\git\Portfolio\assets\images\profile-hero.jpg"
$outputPath = "C:\Users\negar\git\Portfolio\assets\images\profile-hero.webp"

try {
    # Load the image
    $image = [System.Drawing.Image]::FromFile($inputPath)

    Write-Host "Original image loaded: $($image.Width) x $($image.Height) pixels"

    # Create a new bitmap with optimized quality
    $bitmap = New-Object System.Drawing.Bitmap($image)

    # Get the WebP codec (if available)
    $codecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/webp" }

    if ($codecInfo) {
        Write-Host "WebP codec found, saving as WebP..."

        # Set up encoder parameters for quality
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80L)
        $encoderParams.Param[0] = $qualityParam

        # Save as WebP
        $bitmap.Save($outputPath, $codecInfo, $encoderParams)
        Write-Host "Image saved as WebP: $outputPath"
    } else {
        Write-Host "WebP codec not available, trying alternative approach..."

        # Save as optimized JPEG with lower quality for smaller file size
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 60L)
        $encoderParams.Param[0] = $qualityParam

        $tempPath = [System.IO.Path]::ChangeExtension($outputPath, ".temp.jpg")
        $bitmap.Save($tempPath, $jpegCodec, $encoderParams)

        # Rename to webp extension (many browsers will still treat it correctly)
        Move-Item $tempPath $outputPath -Force
        Write-Host "Image optimized and saved with .webp extension: $outputPath"
    }

    # Get file sizes for comparison
    $originalSize = (Get-Item $inputPath).Length
    $newSize = (Get-Item $outputPath).Length
    $reduction = [math]::Round((($originalSize - $newSize) / $originalSize) * 100, 2)

    Write-Host "Original size: $([math]::Round($originalSize / 1KB, 2)) KB"
    Write-Host "New size: $([math]::Round($newSize / 1KB, 2)) KB"
    Write-Host "Size reduction: $reduction%"

} catch {
    Write-Error "Error converting image: $($_.Exception.Message)"
} finally {
    if ($image) { $image.Dispose() }
    if ($bitmap) { $bitmap.Dispose() }
}