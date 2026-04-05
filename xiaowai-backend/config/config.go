package config

import (
	"sync"

	"github.com/spf13/viper"
)

var (
	globalConfig = new(Config)
	once         sync.Once
)

func Init(configfilepath string) {
	once.Do(func() {
		viper.SetConfigFile(configfilepath)
		if err := viper.ReadInConfig(); err != nil {
			panic(err)
		}
		if err := viper.Unmarshal(globalConfig); err != nil {
			panic(err)
		}
		globalConfig.initialized = true
	})
}

func Get() *Config {
	if globalConfig.initialized {
		return globalConfig
	}
	panic("global config was not initialized")
}

type Config struct {
	initialized bool
	Env         string `mapstructure:"env"`
	DB          struct {
		Xiaowai DB `mapstructure:"xiaowai"`
	} `mapstructure:"db"`
	Redis struct {
		Xiaowai Redis `mapstructure:"xiaowai"`
	} `mapstructure:"redis"`
	Oss struct {
		Default Oss `mapstructure:"default"`
	} `mapstructure:"oss"`
	LLM struct {
		QianWen LLM `mapstructure:"qianwen"`
	} `mapstructure:"llm"`
	SMTP struct {
		QQ SMTP `mapstructure:"qq"`
	} `mapstructure:"smpt"`
	JWT struct {
		Default JWT `mapstructure:"default"`
	} `mapstructure:"jwt"`
	Log struct {
		Default Logger `mapstructure:"default"`
	} `mapstructure:"logger"`
}

type DB struct {
	Driver   string `mapstructure:"driver"`
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	UserName string `mapstructure:"username"`
	PassWord string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
}

type Redis struct {
	Addr      string `mapstructure:"addr"`
	Password  string `mapstructure:"password"`
	DB        int    `mapstructure:"db"`
	Username  string `mapstructure:"username"`
	NameSpace string `mapstructure:"namespace"`
}

type Oss struct {
	AK       string `mapstructure:"ak"`
	SK       string `mapstructure:"sk"`
	Endpoint string `mapstructure:"endpoint"`
	Region   string `mapstructure:"region"`
}

type LLM struct {
	ApiKey  string `mapstructure:"api_key"`
	BaseUrl string `mapstructure:"base_url"`
	Model   string `mapstructure:"model"`
}

type SMTP struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	UserName string `mapstructure:"username"`
	PassWord string `mapstructure:"password"`
	NickName string `mapstructure:"nickname"`
}

type JWT struct {
	JWTKey string `mapstructure:"jwtkey"`
}

type Logger struct {
	FileName   string `mapstructure:"filename"`
	MaxSize    int    `mapstructure:"maxsize"`
	MaxBackups int    `mapstructure:"maxbackups"`
	MaxAge     int    `mapstructure:"maxage"`
	ComPress   bool   `mapstructure:"compress"`
}
