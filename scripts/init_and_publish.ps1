<#
init_and_publish.ps1

Usage examples:
  # Initialize git, commit, and print next steps (no GitHub CLI)
  .\scripts\init_and_publish.ps1

  # Use GitHub CLI (gh) to create repo and push
  .\scripts\init_and_publish.ps1 -UseGh -Visibility public -RepoName my-repo-name

Notes:
 - This script does not store tokens. If you pass -UseGh it will call the `gh` tool and that tool will prompt for auth if needed.
 - If you do not use `-UseGh`, the script will show the git remote commands to run manually (or paste the remote URL).
#>

param(
    [string]$RepoName = $(Split-Path -Leaf (Get-Location)),
    [string]$RemoteName = 'origin',
    [ValidateSet('public','private')]
    [string]$Visibility = 'private',
    [switch]$UseGh
)

function Ensure-GitRepository {
    if (-not (Test-Path .git)) {
        git init
        Write-Host "Initialized empty git repository."
    } else {
        Write-Host "Already a git repository."
    }
}

function Commit-All {
    git add --all
    if (-not (git rev-parse --verify HEAD 2>$null)) {
        git commit -m "Initial commit"
    } else {
        # create a new commit if there are staged changes
        if (-not ([string](git diff --cached --name-only))) {
            Write-Host "No changes to commit."
        } else {
            git commit -m "Update"
        }
    }
}

Ensure-GitRepository
Commit-All

if ($UseGh) {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "Error: GitHub CLI 'gh' not found. Install it first: https://cli.github.com/"
        exit 2
    }
    # Create repository and push using gh (will prompt/authenticate as needed)
    Write-Host "Creating repository '$RepoName' on GitHub (visibility: $Visibility) and pushing..."
    gh repo create $RepoName --$Visibility --source=. --push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Repository created and pushed successfully."
    } else {
        Write-Host "gh exited with code $LASTEXITCODE. Check output above."
    }
} else {
    Write-Host "\nNo remote created. To publish manually, run these commands (replace <REMOTE_URL>):\n"
    Write-Host "git remote add $RemoteName <REMOTE_URL>"
    Write-Host "git branch -M main"
    Write-Host "git push -u $RemoteName main"
    Write-Host "\nOr use GitHub CLI to create and push:"
    Write-Host "gh repo create $RepoName --private --source=. --push"
}
