// Application (类)
// │
// ├─ start() [入口]
// │   ├─ initializeServices()
// │   │   ├─ validateConfig()
// │   │   │   ├─ isValidDatabaseUrl() (Validator类)
// │   │   │   └─ validateCacheSettings()
// │   │   ├─ db.connect()
// │   │   └─ registerShutdownHooks()
// │   │       └─ gracefulShutdown()
// │   │           ├─ db.disconnect()
// │   │           └─ cleanupResources()
// │   └─ loadInitialData()
// │       ├─ fetchActiveUsers()
// │       │   ├─ buildActiveUsersQuery()
// │       │   └─ processUserData()
// │       │       ├─ extractUserRoles()
// │       │       │   └─ determineAdditionalRoles()
// │       │       │       ├─ isAdminUser()
// │       │       │       ├─ hasPurchaseHistory()
// │       │       │       └─ isContentContributor()
// │       │       └─ parseUserMetadata()
// │       └─ fetchFeaturedProducts()
// │
// └─ handleStartupError()
//     ├─ isDatabaseError()
//     └─ isConfigurationError()

// function-nesting-test.ts
// 专为测试函数嵌套关系设计的示例

class Application {
  private db = new Database();
  private validator = new Validator();

  /** 主入口 */
  async start(config: AppConfig) {
    await this.initializeServices(config);
    await this.loadInitialData();
  }

  /** 初始化服务 */
  private async initializeServices(config: AppConfig) {
    this.validateConfig(config);
    await this.db.connect(config.databaseUrl);
    this.registerShutdownHooks();
  }

  /** 验证配置 */
  private validateConfig(config: AppConfig) {
    if (!this.validator.isValidDatabaseUrl(config.databaseUrl)) {
      throw new Error("Invalid DB URL");
    }
    this.validateCacheSettings(config.cacheSettings);
  }

  /** 验证缓存设置 */
  private validateCacheSettings(settings: CacheSettings) {
    if (settings.enabled && settings.ttl < 60) {
      throw new Error("TTL too short");
    }
  }

  /** 注册关闭钩子 */
  private registerShutdownHooks() {
    process.on("SIGTERM", () => this.gracefulShutdown());
  }

  /** 优雅关闭 */
  private async gracefulShutdown() {
    await this.db.disconnect();
    await this.cleanupResources();
  }

  /** 清理资源 */
  private async cleanupResources() {
    console.log("Cleaning up...");
  }

  /** 加载初始数据 */
  private async loadInitialData() {
    const users = await this.fetchActiveUsers();
    console.log(`Loaded ${users.length} users`);
  }

  /** 获取活跃用户 */
  private async fetchActiveUsers(): Promise<User[]> {
    const query = this.buildActiveUsersQuery();
    const rawUsers = await this.db.query(query);
    return this.processUserData(rawUsers);
  }

  /** 构建查询语句 */
  private buildActiveUsersQuery(): string {
    return 'SELECT * FROM users WHERE status = "active"';
  }

  /** 处理用户数据 */
  private processUserData(rawUsers: any[]): User[] {
    return rawUsers.map(user => ({
      id: user.id,
      name: user.name,
      roles: this.extractUserRoles(user),
    }));
  }

  /** 提取用户角色 */
  private extractUserRoles(user: any): string[] {
    const baseRoles = user.roles.split(",");
    const additionalRoles = this.determineAdditionalRoles(user);
    return [...baseRoles, ...additionalRoles];
  }

  /** 确定额外角色 */
  private determineAdditionalRoles(user: any): string[] {
    const roles: string[] = [];
    if (this.isAdminUser(user)) roles.push("admin");
    if (this.hasPurchaseHistory(user)) roles.push("customer");
    return roles;
  }

  /** 检查管理员 */
  private isAdminUser(user: any): boolean {
    return user.permissions.includes("admin");
  }

  /** 检查购买历史 */
  private hasPurchaseHistory(user: any): boolean {
    return user.totalPurchases > 0;
  }
}

// ---------- 以下是模拟的依赖类型声明 ----------
interface AppConfig {
  databaseUrl: string;
  cacheSettings: CacheSettings;
}

interface CacheSettings {
  enabled: boolean;
  ttl: number;
}

interface User {
  id: number;
  name: string;
  roles: string[];
}

class Database {
  async connect(url: string) {}
  async disconnect() {}
  async query(sql: string): Promise<any> {
    return [{ id: 1, name: "Test", roles: "user", permissions: [], totalPurchases: 0 }];
  }
}

class Validator {
  isValidDatabaseUrl(url: string): boolean {
    return url.startsWith("http");
  }
}

// ---------- 测试执行 ----------
new Application().start({
  databaseUrl: "http://localhost",
  cacheSettings: { enabled: true, ttl: 300 },
});