/**
 * UserRepository
 *
 * Handles all database operations for user management in the MVP architecture.
 * This is the only layer that should access Supabase for user-related data.
 */

import {
  AbstractSupabaseRepository,
  RepositoryErrorFactory,
} from './BaseRepository'
import type { BaseEntity } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AuthUser,
  UserRepository as IUserRepository,
  LoginCredentials,
  RegisterData,
} from '@/usecases/UserManagementUseCase'

export interface User extends BaseEntity {
  readonly email: string
  readonly role?: string
  readonly company_id?: string
  readonly permissions?: Array<string>
  readonly is_active?: boolean
  readonly email_verified?: boolean
  readonly last_login?: string
  readonly first_name?: string
  readonly last_name?: string
  readonly phone?: string
  readonly avatar_url?: string
  readonly login_attempts?: number
  readonly locked_until?: string | null
}

export interface LoginAttempt extends BaseEntity {
  readonly user_email: string
  readonly success: boolean
  readonly ip_address?: string
  readonly user_agent?: string
  readonly attempted_at: string
}

/**
 * Supabase implementation of UserRepository
 */
export class SupabaseUserRepository
  extends AbstractSupabaseRepository<User>
  implements Partial<IUserRepository>
{
  constructor(client: SupabaseClient) {
    super(client, 'users')
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw RepositoryErrorFactory.databaseError('Failed to find user', error)
    }

    return this.mapUserRow(data)
  }

  async create(
    data: Omit<User, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<User> {
    const { data: result, error } = await this.client
      .from('users')
      .insert({
        ...data,
        is_active: data.is_active ?? true,
        email_verified: data.email_verified ?? false,
        login_attempts: 0,
      })
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError('Failed to create user', error)
    }

    return this.mapUserRow(result)
  }

  async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'created_at'>>,
  ): Promise<User> {
    const { data: result, error } = await this.client
      .from('users')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError('Failed to update user', error)
    }

    if (!result) {
      throw RepositoryErrorFactory.notFound('User', id)
    }

    return this.mapUserRow(result)
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(
    credentials: LoginCredentials,
  ): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error || !data.user) {
      return null
    }

    // Get user profile
    const profile = await this.findByEmail(credentials.email)
    if (!profile) {
      return null
    }

    return this.mapToAuthUser(data.user, profile)
  }

  /**
   * Create user account
   */
  async createUser(userData: RegisterData): Promise<AuthUser> {
    // Create auth user
    const { data, error } = await this.client.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    })

    if (error || !data.user) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to create auth user',
        error,
      )
    }

    // Create user profile
    const profile = await this.create({
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role || 'buyer',
      is_active: true,
      email_verified: false,
    })

    return this.mapToAuthUser(data.user, profile)
  }

  /**
   * Get user login attempts count
   */
  async getUserLoginAttempts(email: string): Promise<number> {
    const user = await this.findByEmail(email)
    return user?.login_attempts || 0
  }

  /**
   * Record login attempt
   */
  async recordLoginAttempt(email: string, success: boolean): Promise<void> {
    const user = await this.findByEmail(email)
    if (!user) return

    // Record in login_attempts table
    await this.client.from('login_attempts').insert({
      user_email: email,
      success,
      attempted_at: new Date().toISOString(),
    })

    // Update user's login attempts counter
    if (success) {
      await this.client
        .from('users')
        .update({
          login_attempts: 0,
          last_login: new Date().toISOString(),
          locked_until: null,
        })
        .eq('email', email)
    } else {
      await this.client
        .from('users')
        .update({
          login_attempts: (user.login_attempts || 0) + 1,
        })
        .eq('email', email)
    }
  }

  /**
   * Check if user is locked
   */
  async isUserLocked(
    email: string,
  ): Promise<{ locked: boolean; until?: number }> {
    const user = await this.findByEmail(email)
    if (!user || !user.locked_until) {
      return { locked: false }
    }

    const lockUntil = new Date(user.locked_until).getTime()
    const now = Date.now()

    if (lockUntil > now) {
      return { locked: true, until: lockUntil }
    }

    // Lock has expired, clear it
    await this.unlockUser(email)
    return { locked: false }
  }

  /**
   * Lock user account
   */
  async lockUser(email: string, until: number): Promise<void> {
    await this.client
      .from('users')
      .update({
        locked_until: new Date(until).toISOString(),
      })
      .eq('email', email)
  }

  /**
   * Unlock user account
   */
  async unlockUser(email: string): Promise<void> {
    await this.client
      .from('users')
      .update({
        locked_until: null,
        login_attempts: 0,
      })
      .eq('email', email)
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw RepositoryErrorFactory.databaseError(
        'Failed to find user by email',
        error,
      )
    }

    return this.mapUserRow(data)
  }

  /**
   * Map database row to User entity
   */
  private mapUserRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      company_id: row.company_id,
      permissions: row.permissions,
      is_active: row.is_active,
      email_verified: row.email_verified,
      last_login: row.last_login,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      avatar_url: row.avatar_url,
      login_attempts: row.login_attempts,
      locked_until: row.locked_until,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    }
  }

  /**
   * Map to AuthUser for use cases
   */
  private mapToAuthUser(_authUser: any, profile: User): AuthUser {
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      company_id: profile.company_id,
      permissions: profile.permissions,
      is_active: profile.is_active,
      email_verified: profile.email_verified,
      last_login: profile.last_login,
      created_at: profile.created_at,
    }
  }

  /**
   * Apply custom search logic for users
   */
  protected applySearch(query: any, search: string): any {
    return query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
    )
  }
}

/**
 * Factory function for creating UserRepository
 */
export function makeUserRepository(
  client: SupabaseClient,
): SupabaseUserRepository {
  return new SupabaseUserRepository(client)
}
