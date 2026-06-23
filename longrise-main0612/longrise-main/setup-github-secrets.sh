#!/bin/bash
# Longrise GitHub Secrets Setup Script for Staging
# This script configures GitHub repository secrets for staging CI/CD

set -e

echo "🔐 Longrise GitHub Secrets Setup (Staging)"
echo "=========================================="

# Check if gh is authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ GitHub CLI is not authenticated. Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json owner,name -q '.owner.login + "/" + .name')
echo "📁 Repository: $REPO"

# Source AWS configuration to get EC2 info
echo "🔍 Getting EC2 information..."
source ./AWS_switch-to-longrise.sh > /dev/null 2>&1

# Get current EC2 instance public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --query 'Reservations[*].Instances[?State.Name==`running`].PublicIpAddress' \
    --output text | head -n1)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
    echo "❌ No running EC2 instance found or no public IP assigned."
    echo "💡 Please create and configure your EC2 instance first."
    read -p "🔄 Enter EC2 Public IP manually (or press Enter to skip): " MANUAL_IP
    if [ ! -z "$MANUAL_IP" ]; then
        PUBLIC_IP=$MANUAL_IP
    else
        echo "⏭️  Skipping EC2_HOST secret - you can set it manually later"
    fi
fi

# Get database URL from FastAPI env
echo "🗄️  Getting database configuration..."
DB_URL=$(grep "^DATABASE_URL=" lr_fastapi/.env.local | cut -d'=' -f2)

# Setup secrets
echo "🔧 Setting up GitHub Secrets..."

# EC2_HOST
if [ ! -z "$PUBLIC_IP" ]; then
    echo "   📡 Setting EC2_HOST..."
    echo "$PUBLIC_IP" | gh secret set EC2_HOST
    echo "      ✅ EC2_HOST set to: $PUBLIC_IP"
fi

# EC2_USERNAME
echo "   👤 Setting EC2_USERNAME..."
echo "ubuntu" | gh secret set EC2_USERNAME
echo "      ✅ EC2_USERNAME set to: ubuntu"

# RDS_URL
if [ ! -z "$DB_URL" ]; then
    echo "   🗄️  Setting RDS_URL..."
    echo "$DB_URL" | gh secret set RDS_URL
    echo "      ✅ RDS_URL set"
else
    echo "   ⚠️  DATABASE_URL not found in lr_fastapi/.env.local"
fi

# SSH Key setup
echo "   🔑 Setting up SSH Key..."
echo ""
echo "🔍 Looking for SSH keys in common locations..."

# Common SSH key locations
SSH_KEY_PATHS=(
    "$HOME/.ssh/longrise-key.pem"
    "$HOME/.ssh/longrise.pem"
    "$HOME/.ssh/ec2-key.pem"
    "$HOME/.ssh/aws-key.pem"
    "$HOME/Downloads/longrise-key.pem"
    "$HOME/Downloads/longrise.pem"
)

SSH_KEY_FILE=""
for key_path in "${SSH_KEY_PATHS[@]}"; do
    if [ -f "$key_path" ]; then
        echo "   📋 Found SSH key: $key_path"
        SSH_KEY_FILE="$key_path"
        break
    fi
done

if [ -z "$SSH_KEY_FILE" ]; then
    echo "   🔍 No SSH key found in common locations."
    read -p "   📝 Please enter the path to your EC2 SSH key (.pem file): " SSH_KEY_PATH

    if [ -f "$SSH_KEY_PATH" ]; then
        SSH_KEY_FILE="$SSH_KEY_PATH"
    else
        echo "   ❌ SSH key file not found: $SSH_KEY_PATH"
        echo "   💡 You can set EC2_SSH_KEY secret manually later"
        SSH_KEY_FILE=""
    fi
fi

if [ ! -z "$SSH_KEY_FILE" ]; then
    echo "   🔒 Setting EC2_SSH_KEY..."
    cat "$SSH_KEY_FILE" | gh secret set EC2_SSH_KEY
    echo "      ✅ EC2_SSH_KEY set from: $SSH_KEY_FILE"
fi

echo ""
echo "🎉 GitHub Secrets setup for staging completed!"
echo ""
echo "📋 Configured secrets:"
gh secret list

echo ""
echo "🔗 Your GitHub Actions staging workflow is ready!"
echo "   📁 Workflow file: .github/workflows/deploy.yml"
echo "   🚀 Deploys on push to stage branch"
echo ""

if [ ! -z "$PUBLIC_IP" ]; then
    echo "🌐 After staging deployment, your app will be available at:"
    echo "   📊 API: http://$PUBLIC_IP:8000"
    echo "   👤 User Frontend: http://$PUBLIC_IP:5173"
    echo "   🔧 Admin Frontend: http://$PUBLIC_IP:5174"
fi

echo ""
echo "💡 Next steps:"
echo "   1. Create/configure your staging EC2 instance if not done already"
echo "   2. Run: ./setup-aws-security-groups.sh"
echo "   3. Update CORS origins in lr_fastapi/.env.local with staging EC2 IP"
echo "   4. Push to stage branch to trigger staging deployment"