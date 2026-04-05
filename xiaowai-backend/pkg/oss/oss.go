package oss

import (
	"context"
	"fmt"
	"io"
	"spaceblue/config"
	"strings"
	"sync"
	"time"

	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss/credentials"
	"github.com/sirupsen/logrus"
)

var client *oss.Client
var once sync.Once

func Init() {
	once.Do(func() {
		provider := credentials.NewStaticCredentialsProvider(config.Get().Oss.Default.AK, config.Get().Oss.Default.SK)

		cfg := oss.LoadDefaultConfig().WithCredentialsProvider(provider).WithRegion(config.Get().Oss.Default.Region)

		client = oss.NewClient(cfg)
	})
}
func ParsePath(path string) (bucket string, key string, err error) {
	if !strings.HasPrefix(path, "oss://") {
		return "", "", fmt.Errorf("oss path invalid a %s", path)
	}
	path = strings.TrimPrefix(path, "oss://")
	paths := strings.SplitN(path, "/", 2)
	if len(paths) != 2 {
		return "", "", fmt.Errorf("oss path invalid b %s", path)
	}
	bucket, key = paths[0], paths[1]
	return bucket, key, nil
}

func GetObject(ctx context.Context, bucketName string, objectKey string) (output *oss.GetObjectResult, err error) {
	now := time.Now()
	defer func() {
		cost := time.Since(now)
		if cost >= 500*time.Millisecond {
			logrus.Debugf("GetObjectV2 cost time: %v\n", time.Since(now))
		}
	}()
	return client.GetObject(ctx, &oss.GetObjectRequest{
		Bucket: &bucketName,
		Key:    &objectKey,
	})
}

func GetObjectByPath(ctx context.Context, osspath string) (output *oss.GetObjectResult, err error) {
	bucketname, key, err := ParsePath(osspath)
	if err != nil {
		return nil, err
	}
	return GetObject(ctx, bucketname, key)
}

func PutObject(ctx context.Context, bucketName string, objectKey string, reader io.Reader) (err error) {
	request := &oss.PutObjectRequest{
		Bucket: &bucketName,
		Key:    &objectKey,
		Body:   reader,
	}
	_, err = client.PutObject(ctx, request)
	if err != nil {
		return err
	}
	return nil
}

func PutObjectByPath(ctx context.Context, ossPath string, reader io.Reader) (err error) {
	bucket, key, err := ParsePath(ossPath)
	if err != nil {
		return err
	}
	return PutObject(ctx, bucket, key, reader)
}
