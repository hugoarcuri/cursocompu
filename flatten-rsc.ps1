param([string]$OutDir = "out")

do {
  $any = $false
  Get-ChildItem -Directory -Path $OutDir -Filter "__next.*" -Recurse | ForEach-Object {
    $dir = $_
    $prefix = $dir.Name
    $parent = $dir.Parent.FullName

    Get-ChildItem -Path $dir.FullName | ForEach-Object {
      $child = $_
      $newName = "$prefix.$($child.Name)"
      $dest = Join-Path $parent $newName

      if (-not (Test-Path $dest)) {
        if ($child -is [System.IO.DirectoryInfo]) {
          Copy-Item -Recurse -Path $child.FullName -Destination $dest -Force
        } else {
          Copy-Item -Path $child.FullName -Destination $dest -Force
        }
        $any = $true
      }
    }
  }
} while ($any)
