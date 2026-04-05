package redis

import (
	"context"
	"fmt"
	"spaceblue/config"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var client *Client
var once sync.Once

type Client struct {
	client    *redis.Client
	namespace string
}

func Init() {
	once.Do(func() {
		client = NewClient(config.Get().Redis.Spaceblue.NameSpace, config.Get().Redis.Spaceblue.Addr,
			config.Get().Redis.Spaceblue.Password, config.Get().Redis.Spaceblue.DB)

	})
}
func NewClient(namespace string, addr, password string, db int) *Client {
	return &Client{
		namespace: namespace,
		client: redis.NewClient(&redis.Options{
			Addr:     addr,
			Password: password,
			DB:       db,
		}),
	}
}

func GetClient() *Client {
	return client
}

func (c *Client) Del(ctx context.Context, key string) (int64, error) {
	return c.client.Del(ctx, fmt.Sprintf("%s:%s", c.namespace, key)).Result()
}

func (c *Client) Set(ctx context.Context, key string, val interface{}, expiration time.Duration) error {
	return c.client.Set(ctx, fmt.Sprintf("%s:%s", c.namespace, key), val, expiration).Err()
}

func (c *Client) Get(ctx context.Context, key string) (string, error) {
	return c.client.Get(ctx, fmt.Sprintf("%s:%s", c.namespace, key)).Result()
}
