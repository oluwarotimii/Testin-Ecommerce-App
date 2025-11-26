# Script to add formatPrice import and update price displays
# This will be used to batch update multiple files

$filesToUpdate = @(
    "app\product\[id].tsx",
    "app\products.tsx",
    "app\search.tsx",
    "app\wishlist.tsx",
    "app\category\[slug].tsx",
    "app\order\[orderId].tsx"
)

foreach ($file in $filesToUpdate) {
    $fullPath = Join-Path "c:\Users\Administrator\Desktop\CODE\techin" $file
    if (Test-Path $fullPath) {
        Write-Host "File exists: $file"
    } else {
        Write-Host "File NOT found: $file"
    }
}
