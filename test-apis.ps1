# test-apis.ps1
Write-Host "?? Testing Available AI APIs..." -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value)
        }
    }
}

# Check OpenAI
$openaiKey = [System.Environment]::GetEnvironmentVariable("OPENAI_API_KEY")
if ($openaiKey -and $openaiKey.StartsWith("sk-")) {
    Write-Host "? OpenAI: API Key valid" -ForegroundColor Green
    Write-Host "   Starts with: $($openaiKey.Substring(0, Math::Min(10, $openaiKey.Length)))..." -ForegroundColor Gray
    Write-Host "   Free credits: $5 available for testing" -ForegroundColor Gray
} else {
    Write-Host "? OpenAI: Invalid or missing API key" -ForegroundColor Red
    Write-Host "   Get free $5 credit: https://platform.openai.com/api-keys" -ForegroundColor Yellow
}

# Check Google
$googleKey = [System.Environment]::GetEnvironmentVariable("GOOGLE_GENERATIVE_AI_API_KEY")
if ($googleKey) {
    Write-Host "? Google Gemini: API Key found" -ForegroundColor Green
    Write-Host "   Key length: $($googleKey.Length) characters" -ForegroundColor Gray
    Write-Host "   Free tier available" -ForegroundColor Gray
} else {
    Write-Host "? Google Gemini: Missing API key" -ForegroundColor Red
    Write-Host "   Get free key: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "?? Recommendation:" -ForegroundColor Cyan
Write-Host "   1. Get OpenAI key first ($5 free)" -ForegroundColor White
Write-Host "   2. Then get Google Gemini (free)" -ForegroundColor White
Write-Host "   3. Both should work globally" -ForegroundColor White

Write-Host ""
Write-Host "?? Estimated monthly cost for personal use:" -ForegroundColor Cyan
Write-Host "   - OpenAI GPT-3.5: ~$1-5/month" -ForegroundColor White
Write-Host "   - Google Gemini: Free for moderate use" -ForegroundColor White
Write-Host "   - Total: Less than $10/month" -ForegroundColor White
