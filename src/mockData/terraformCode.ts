import { TerraformResource } from '../types/devsecops';

export const initialTerraformResources: TerraformResource[] = [
  {
    id: 'res-vpc',
    type: 'aws_vpc',
    name: 'devsecops_production_vpc',
    status: 'Applied',
    provider: 'aws',
    details: {
      cidr_block: '10.0.0.0/16',
      subnets: ['10.0.1.0/24 (public-1a)', '10.0.2.0/24 (public-1b)', '10.0.10.0/24 (private-1a)', '10.0.20.0/24 (private-1b)'],
      nat_gateways: 2,
      internet_gateway: 'igw-08a9f23',
    },
    hclSnippet: `resource "aws_vpc" "devsecops_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "devsecops-production-vpc"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}`
  },
  {
    id: 'res-eks',
    type: 'aws_eks_cluster',
    name: 'devsecops_cloud_cluster',
    status: 'Applied',
    provider: 'aws',
    details: {
      version: '1.30',
      node_groups: 'managed-ng-t3-large (3 to 10 nodes)',
      endpoint_private_access: true,
      endpoint_public_access: true,
      encryption_config: 'KMS Key arn:aws:kms:us-east-1:123456789:key/eks-sec',
    },
    hclSnippet: `module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "devsecops-cloud-cluster"
  cluster_version = "1.30"

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  eks_managed_node_groups = {
    general = {
      instance_types = ["t3.large"]
      min_size       = 3
      max_size       = 10
      desired_size   = 4
    }
  }
}`
  },
  {
    id: 'res-alb',
    type: 'aws_lb',
    name: 'ingress_application_load_balancer',
    status: 'Applied',
    provider: 'aws',
    details: {
      type: 'application',
      scheme: 'internet-facing',
      dns_name: 'k8s-ingress-alb-19482.us-east-1.elb.amazonaws.com',
      tls_policy: 'ELBSecurityPolicy-TLS13-1-2-2021-06',
    },
    hclSnippet: `resource "aws_lb" "app_alb" {
  name               = "devsecops-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = false
}`
  },
  {
    id: 'res-iam',
    type: 'aws_iam_role',
    name: 'irsa_vault_secrets_role',
    status: 'Applied',
    provider: 'aws',
    details: {
      service_account: 'kube-system:aws-load-balancer-controller',
      policies: ['AWSLoadBalancerControllerIAMPolicy', 'SecretsManagerReadPolicy'],
      oidc_provider: 'oidc.eks.us-east-1.amazonaws.com/id/8394F',
    },
    hclSnippet: `module "secrets_manager_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.30"

  role_name = "devsecops-secrets-irsa"
  attach_secrets_manager_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["production:backend-service-sa"]
    }
  }
}`
  },
  {
    id: 'res-ecr',
    type: 'aws_ecr_repository',
    name: 'devsecops_app_registry',
    status: 'Applied',
    provider: 'aws',
    details: {
      image_tag_mutability: 'IMMUTABLE',
      scan_on_push: true,
      encryption: 'KMS (aws/ecr)',
      repository_url: '123456789.dkr.ecr.us-east-1.amazonaws.com/devsecops-app',
    },
    hclSnippet: `resource "aws_ecr_repository" "app_repo" {
  name                 = "devsecops-app"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }
}`
  }
];
