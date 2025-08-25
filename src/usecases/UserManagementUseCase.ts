/**
 * UserManagementUseCase
 *
 * Handles business logic for user authentication, authorization, and profile management.
 * This includes login attempts, account lockouts, role validation, and security policies.
 */

export interface AuthUser {
  readonly id: string
  readonly email: string
  readonly role?: string
  readonly company_id?: string
  readonly permissions?: Array<string>
  readonly is_active?: boolean
  readonly email_verified?: boolean
  readonly last_login?: string
  readonly created_at?: string
  readonly [key: string]: unknown
}

export interface LoginCredentials {
  readonly email: string
  readonly password: string
}

export interface RegisterData {
  readonly email: string
  readonly password: string
  readonly firstName?: string
  readonly lastName?: string
  readonly company?: string
  readonly role?: string
}

export interface LoginResult {
  readonly success: boolean
  readonly user?: AuthUser
  readonly error?: string
  readonly isLocked?: boolean
  readonly lockoutUntil?: number
  readonly attemptsRemaining?: number
}

export interface SecuritySettings {
  readonly maxLoginAttempts: number
  readonly lockoutDurationMs: number
  readonly passwordMinLength: number
  readonly requireEmailVerification: boolean
  readonly sessionTimeoutMs: number
}

export interface UserRepository {
  authenticateUser: (credentials: LoginCredentials) => Promise<AuthUser | null>
  createUser: (userData: RegisterData) => Promise<AuthUser>
  getUserById: (id: string) => Promise<AuthUser | null>
  updateUser: (id: string, updates: Partial<AuthUser>) => Promise<AuthUser>
  deleteUser: (id: string) => Promise<void>
  getUserLoginAttempts: (email: string) => Promise<number>
  recordLoginAttempt: (email: string, success: boolean) => Promise<void>
  isUserLocked: (email: string) => Promise<{ locked: boolean; until?: number }>
  lockUser: (email: string, until: number) => Promise<void>
  unlockUser: (email: string) => Promise<void>
}

export class UserManagementUseCase {
  private securitySettings: SecuritySettings = {
    maxLoginAttempts: 5,
    lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    requireEmailVerification: true,
    sessionTimeoutMs: 60 * 60 * 1000, // 1 hour
  }

  constructor(private userRepository: UserRepository) {}

  /**
   * Authenticate user with security checks
   */
  async loginUser(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      // Check if user is locked
      const lockStatus = await this.userRepository.isUserLocked(
        credentials.email,
      )
      if (lockStatus.locked) {
        return {
          success: false,
          error:
            'Account is temporarily locked due to too many failed attempts',
          isLocked: true,
          lockoutUntil: lockStatus.until,
        }
      }

      // Get current login attempts
      const attempts = await this.userRepository.getUserLoginAttempts(
        credentials.email,
      )
      const attemptsRemaining =
        this.securitySettings.maxLoginAttempts - attempts

      // Validate credentials
      const validationError = this.validateLoginCredentials(credentials)
      if (validationError) {
        await this.userRepository.recordLoginAttempt(credentials.email, false)
        return {
          success: false,
          error: validationError,
          attemptsRemaining: Math.max(0, attemptsRemaining - 1),
        }
      }

      // Attempt authentication
      const user = await this.userRepository.authenticateUser(credentials)

      if (!user) {
        await this.userRepository.recordLoginAttempt(credentials.email, false)

        // Check if we should lock the account
        if (attempts + 1 >= this.securitySettings.maxLoginAttempts) {
          const lockUntil = Date.now() + this.securitySettings.lockoutDurationMs
          await this.userRepository.lockUser(credentials.email, lockUntil)

          return {
            success: false,
            error:
              'Invalid credentials. Account has been locked due to too many failed attempts.',
            isLocked: true,
            lockoutUntil: lockUntil,
          }
        }

        return {
          success: false,
          error: 'Invalid email or password',
          attemptsRemaining: Math.max(0, attemptsRemaining - 1),
        }
      }

      // Successful login
      await this.userRepository.recordLoginAttempt(credentials.email, true)

      // Additional security checks
      const securityCheck = this.performSecurityChecks(user)
      if (!securityCheck.allowed) {
        return {
          success: false,
          error: securityCheck.reason,
        }
      }

      return {
        success: true,
        user,
      }
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during login. Please try again.',
      }
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData: RegisterData): Promise<LoginResult> {
    try {
      // Validate registration data
      const validationError = this.validateRegistrationData(userData)
      if (validationError) {
        return {
          success: false,
          error: validationError,
        }
      }

      // Create user
      const user = await this.userRepository.createUser(userData)

      return {
        success: true,
        user,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create account. Please try again.',
      }
    }
  }

  /**
   * Check if user has required permissions
   */
  hasPermission(user: AuthUser, requiredPermission: string): boolean {
    if (!user.permissions) return false
    return user.permissions.includes(requiredPermission)
  }

  /**
   * Check if user has required role
   */
  hasRole(user: AuthUser, requiredRole: string): boolean {
    return user.role === requiredRole
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(user: AuthUser, requiredRoles: Array<string>): boolean {
    return requiredRoles.includes(user.role || '')
  }

  /**
   * Validate login credentials
   */
  private validateLoginCredentials(
    credentials: LoginCredentials,
  ): string | null {
    if (!credentials.email) {
      return 'Email is required'
    }

    if (!this.isValidEmail(credentials.email)) {
      return 'Please enter a valid email address'
    }

    if (!credentials.password) {
      return 'Password is required'
    }

    return null
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(userData: RegisterData): string | null {
    if (!userData.email) {
      return 'Email is required'
    }

    if (!this.isValidEmail(userData.email)) {
      return 'Please enter a valid email address'
    }

    if (!userData.password) {
      return 'Password is required'
    }

    if (userData.password.length < this.securitySettings.passwordMinLength) {
      return `Password must be at least ${this.securitySettings.passwordMinLength} characters long`
    }

    if (!this.isStrongPassword(userData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    return null
  }

  /**
   * Perform additional security checks on user
   */
  private performSecurityChecks(user: AuthUser): {
    allowed: boolean
    reason?: string
  } {
    if (!user.is_active) {
      return {
        allowed: false,
        reason: 'Account is deactivated. Please contact support.',
      }
    }

    if (
      this.securitySettings.requireEmailVerification &&
      !user.email_verified
    ) {
      return {
        allowed: false,
        reason: 'Please verify your email address before logging in.',
      }
    }

    return { allowed: true }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Check if password meets strength requirements
   */
  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    return hasUpperCase && hasLowerCase && hasNumbers
  }

  /**
   * Calculate time until lockout expires
   */
  getTimeUntilUnlock(lockoutUntil: number): number {
    return Math.max(0, lockoutUntil - Date.now())
  }

  /**
   * Format lockout time for display
   */
  formatLockoutTime(lockoutUntil: number): string {
    const timeRemaining = this.getTimeUntilUnlock(lockoutUntil)
    const minutes = Math.ceil(timeRemaining / (60 * 1000))

    if (minutes <= 0) return 'Account unlocked'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }
}
