# 🚀 Tiến độ Deploy NỘI THẤT NHANH lên Google Cloud

> Cập nhật lần cuối: 2026-01-07

## 📋 Tổng quan

| Thông tin | Giá trị |
|-----------|---------|
| Project ID | `noithatnhanh` |
| Region | `asia-southeast1` |
| Domain | `noithanhnhanh.vn` |
| GitHub Repo | `thienvyma/anhthoxay` |

---

## ✅ PHASE 1: Chuẩn bị (HOÀN THÀNH)

### 1.1 Cài đặt công cụ
- [x] Google Cloud CLI (v551.0.0)
- [x] Docker (v28.4.0)
- [x] Git

### 1.2 Đăng nhập GCP
- [x] `gcloud auth login` với tài khoản `thienvyma@gmail.com`
- [x] Set project: `gcloud config set project noithatnhanh`

---

## ✅ PHASE 2: Infrastructure Setup (HOÀN THÀNH)

### 2.1 Enable APIs
- [x] Cloud Build API
- [x] Cloud Run API
- [x] Cloud SQL Admin API
- [x] Cloud Storage API
- [x] Secret Manager API
- [x] Artifact Registry API

### 2.2 Artifact Registry
- [x] Tạo repository `ntn-repo` tại `asia-southeast1`

### 2.3 Cloud SQL (PostgreSQL)
- [x] Tạo instance `ntn-db` (PostgreSQL 15, db-f1-micro)
- [x] IP: `34.158.35.138`
- [x] Tạo database `ntn_production`
- [x] Tạo user `ntn_user`

### 2.4 Cloud Storage
- [x] Tạo bucket `ntn-media-bucket`

### 2.5 Secret Manager
- [x] `DATABASE_URL` - Connection string cho Cloud SQL
- [x] `JWT_SECRET` - JWT signing key
- [x] `ENCRYPTION_KEY` - Encryption key
- [x] `REDIS_URL` - Redis connection (placeholder)

### 2.6 IAM Permissions
- [x] Cloud Run Service Account → Secret Manager access
- [x] Cloud Run Service Account → Cloud SQL Client

---

## ✅ PHASE 3: Code & Configuration (HOÀN THÀNH)

### 3.1 Docker Files
- [x] `infra/docker/api.Dockerfile` - API container
- [x] `infra/docker/frontend.Dockerfile` - Frontend apps container
- [x] `infra/docker/nginx.conf` - Nginx config cho SPA

### 3.2 Cloud Build Configs
- [x] `infra/gcp/cloudbuild-api.yaml`
- [x] `infra/gcp/cloudbuild-landing.yaml`
- [x] `infra/gcp/cloudbuild-admin.yaml`
- [x] `infra/gcp/cloudbuild-portal.yaml`

### 3.3 Scripts
- [x] `infra/gcp/setup.sh` - Setup script
- [x] `infra/gcp/deploy-manual.sh` - Manual deploy script

### 3.4 Documentation
- [x] `docs/DEPLOYMENT_GCP.md` - Hướng dẫn chi tiết

### 3.5 Git Push
- [x] Commit: `feat: Add GCP deployment configuration...`
- [x] Push to `main` branch

---

## ✅ PHASE 4: Cloud Build Setup (HOÀN THÀNH)

### 4.1 Kết nối GitHub Repository
- [x] Vào Cloud Console > Cloud Build > Triggers
- [x] Click "Connect Repository"
- [x] Chọn GitHub > Authorize
- [x] Chọn repo `thienvyma/anhthoxay`
- [x] Click "Connect"

### 4.2 Tạo Build Triggers
- [x] `ntn-api-trigger` - Trigger cho API
- [x] `ntn-landing-trigger` - Trigger cho Landing
- [x] `ntn-admin-trigger` - Trigger cho Admin
- [x] `ntn-portal-trigger` - Trigger cho Portal

---

## 🔄 PHASE 5: Deploy & Test (ĐANG THỰC HIỆN)

### 5.1 First Deploy
- [x] Trigger build cho API (Build ID: 8543e21a-508a-4b0b-9660-b30aa180b2bc)
- [x] Trigger build cho Landing (Build ID: 329cee93-4f9a-4125-a0c6-47f485858516)
- [x] Trigger build cho Admin (Build ID: c426e5c9-936b-47e5-845e-5352f75a5b76)
- [x] Trigger build cho Portal (Build ID: 57da92f6-1e8a-4cc5-a361-a1ac85a55031)

**Theo dõi builds:** https://console.cloud.google.com/cloud-build/builds?project=noithatnhanh

### 5.2 Verify Services
- [ ] API health check
- [ ] Landing page load
- [ ] Admin panel login
- [ ] Portal login

### 5.3 Database Migration
- [ ] Chạy `pnpm db:push` với Cloud SQL
- [ ] Chạy `pnpm db:seed` (nếu cần)

---

## ⏳ PHASE 6: Custom Domain (CHƯA BẮT ĐẦU)

### 6.1 Domain Mapping
- [ ] Map `noithanhnhanh.vn` → Landing
- [ ] Map `api.noithanhnhanh.vn` → API
- [ ] Map `admin.noithanhnhanh.vn` → Admin
- [ ] Map `portal.noithanhnhanh.vn` → Portal

### 6.2 DNS Configuration
- [ ] Cập nhật DNS records tại domain registrar
- [ ] Verify SSL certificates

---

## ⏳ PHASE 7: Production Optimization (CHƯA BẮT ĐẦU)

### 7.1 Redis (Optional)
- [ ] Tạo Memorystore Redis instance
- [ ] Cập nhật REDIS_URL secret
- [ ] Tạo VPC connector

### 7.2 Monitoring
- [ ] Setup Cloud Monitoring alerts
- [ ] Configure error reporting
- [ ] Setup uptime checks

### 7.3 Backup
- [ ] Enable Cloud SQL automated backups
- [ ] Configure backup retention

---

## 📝 Ghi chú

### Credentials đã tạo
```
Database User: ntn_user
Database Password: NtnSecure2024!
Database Name: ntn_production
Connection: noithatnhanh:asia-southeast1:ntn-db
```

### Commands hữu ích
```bash
# Xem logs API
gcloud run services logs read ntn-api --region=asia-southeast1

# Xem danh sách services
gcloud run services list --region=asia-southeast1

# Kết nối database
gcloud sql connect ntn-db --user=ntn_user --database=ntn_production

# Xem secrets
gcloud secrets list
```

---

## 🔗 Links quan trọng

- [Cloud Console](https://console.cloud.google.com/home/dashboard?project=noithatnhanh)
- [Cloud Run](https://console.cloud.google.com/run?project=noithatnhanh)
- [Cloud Build](https://console.cloud.google.com/cloud-build/builds?project=noithatnhanh)
- [Cloud SQL](https://console.cloud.google.com/sql/instances?project=noithatnhanh)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=noithatnhanh)
