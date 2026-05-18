# Sui Smart Contract Deployment Script (Testnet)
# This script helps you deploy the blob_index contract and get the Package ID

Write-Host "--- Sui Contract Deployment (Testnet) ---" -ForegroundColor Cyan

# 1. Check if Sui CLI is installed
if (!(Get-Command sui -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Sui CLI not found. Please install it first." -ForegroundColor Red
    exit
}

# 2. Check current network
$active_env = sui client active-env
if ($active_env -ne "testnet") {
    Write-Host "Warning: Your active environment is '$active_env', not 'testnet'." -ForegroundColor Yellow
    Write-Host "Switching to testnet..."
    sui client switch --env testnet
}

# 3. Get active address
$address = sui client active-address
Write-Host "Deploying from address: $address" -ForegroundColor Green

# 4. Build and Publish
Write-Host "Building and Publishing contract..." -ForegroundColor Gray
$publish_output = sui client publish --gas-budget 100000000 --json

# 5. Parse Output for Package ID
# Note: In a real script, we would parse the JSON output to find the Created object with type "package"
Write-Host "`nDeployment Command Executed!" -ForegroundColor Green
Write-Host "Please look for the 'packageId' in the JSON output above." -ForegroundColor Cyan
Write-Host "Once you have it, update your .env file: VITE_CONTRACT_PACKAGE_ID=0x..." -ForegroundColor Yellow

# Example of how to manually find it if JSON parsing is hard in PS
Write-Host "`nTip: You can also use SuiVision or SuiScan to find your recent transactions and copy the Package ID." -ForegroundColor Gray
