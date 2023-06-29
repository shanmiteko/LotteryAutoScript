使用此功能前需启动OCR服务

## 拉取镜像
```
docker pull shanmite/ocr_api_server
```
## 启动容器
```
docker run -p 9898:9898 -d ocr_api_server
```

### 非docker启动方式
[ocr_api_server](https://github.com/shanmiteko/ocr_api_server)