# PowerShell script to convert files to LF line endings
$extensions = @("*.ts", "*.js", "*.json", "*.md", "*.yml", "*.yaml", "*.env*", "*.gitignore", "*.gitattributes", "*.prettierrc")
$excludeDirs = @("node_modules", "build", "tmp", ".git")

# Create exclude pattern for directories
$excludePattern = ($excludeDirs | ForEach-Object { "^.*\\$_\\.*" }) -join "|"

foreach ($ext in $extensions) {
    Write-Host "Processing $ext files..."
    
    # Get all files with current extension, excluding specified directories
    $files = Get-ChildItem -Path "." -Filter $ext -Recurse -File | 
        Where-Object { $_.FullName -notmatch $excludePattern }
    
    foreach ($file in $files) {
        Write-Host "Converting $($file.Name)..."
        
        # Read the file content
        $content = Get-Content -Path $file.FullName -Raw
        
        if ($content) {
            # Convert to LF
            $content = $content -replace "`r`n", "`n"
            
            # Write back to file with UTF8 encoding without BOM and LF endings
            $utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBomEncoding)
        }
    }
}

Write-Host "Conversion complete!"
