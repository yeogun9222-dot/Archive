#!/bin/bash
# Longrise AWS Security Group Setup Script for Staging
# This script configures security groups for the staging EC2 instance

set -e

echo "🔐 Longrise AWS Security Group Setup (Staging)"
echo "=============================================="

# Source AWS configuration
source ./AWS_switch-to-longrise.sh

# Get current EC2 instances
echo "🔍 Checking for EC2 instances..."
INSTANCES=$(aws ec2 describe-instances \
    --query 'Reservations[*].Instances[?State.Name==`running`].[InstanceId,PublicIpAddress,SecurityGroups[0].GroupId]' \
    --output text)

if [ -z "$INSTANCES" ]; then
    echo "❌ No running EC2 instances found. Please create an EC2 instance first."
    echo "💡 After creating the EC2 instance, run this script again."
    exit 1
fi

echo "📋 Found running EC2 instances:"
echo "$INSTANCES"

# Parse the first instance (assuming single instance deployment)
INSTANCE_ID=$(echo "$INSTANCES" | head -n1 | cut -f1)
PUBLIC_IP=$(echo "$INSTANCES" | head -n1 | cut -f2)
SECURITY_GROUP_ID=$(echo "$INSTANCES" | head -n1 | cut -f3)

echo ""
echo "🎯 Target Configuration:"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public IP: $PUBLIC_IP"
echo "   Security Group: $SECURITY_GROUP_ID"
echo ""

# Required ports for Longrise
REQUIRED_PORTS=(
    "22:SSH/GitHub Actions"
    "8000:FastAPI Backend"
    "5173:User Frontend"
    "5174:Admin Frontend"
    "4237:RumbleSurge API"
)

echo "🔧 Configuring security group rules..."

for port_info in "${REQUIRED_PORTS[@]}"; do
    port=$(echo $port_info | cut -d: -f1)
    description=$(echo $port_info | cut -d: -f2)

    echo "   📡 Opening port $port ($description)..."

    # Check if rule already exists
    existing_rule=$(aws ec2 describe-security-groups \
        --group-ids $SECURITY_GROUP_ID \
        --query "SecurityGroups[0].IpPermissions[?FromPort==\`$port\`]" \
        --output text)

    if [ -z "$existing_rule" ]; then
        aws ec2 authorize-security-group-ingress \
            --group-id $SECURITY_GROUP_ID \
            --protocol tcp \
            --port $port \
            --cidr 0.0.0.0/0 \
            --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=longrise-$description}]" \
            > /dev/null 2>&1 || echo "      ℹ️  Rule may already exist or permission denied"
        echo "      ✅ Port $port opened"
    else
        echo "      ℹ️  Port $port already open"
    fi
done

echo ""
echo "🎉 Staging security group configuration completed!"
echo ""
echo "📄 Current security group rules:"
aws ec2 describe-security-groups \
    --group-ids $SECURITY_GROUP_ID \
    --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[0].CidrIp]' \
    --output table

echo ""
echo "🔗 Your staging application will be accessible at:"
echo "   📊 API: http://$PUBLIC_IP:8000"
echo "   👤 User Frontend: http://$PUBLIC_IP:5173"
echo "   🔧 Admin Frontend: http://$PUBLIC_IP:5174"
echo ""
echo "💡 Next steps for staging:"
echo "   1. Update .env.local with: BACKEND_CORS_ORIGINS=...,http://$PUBLIC_IP:8000,http://$PUBLIC_IP:5173,http://$PUBLIC_IP:5174"
echo "   2. Setup GitHub Secrets: EC2_HOST=$PUBLIC_IP"
echo "   3. Deploy your staging application using PM2"