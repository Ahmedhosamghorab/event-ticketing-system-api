import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * BaseEntity is an abstract class that provides common fields used by all database entities.
 * By making this abstract, we prevent it from being instantiated directly while ensuring
 * code reusability across all domain entities.
 */
export abstract class BaseEntity {
  /**
   * PrimaryGeneratedColumn handles the primary key generation.
   * We use 'increment' type with type 'int' for standard MySQL auto-increment primary keys.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * CreateDateColumn automatically sets the field to the current database timestamp when inserting.
   * We specify 'timestamp' for MySQL compatibility, defaulting to microsecond precision (6).
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  /**
   * UpdateDateColumn automatically updates the timestamp to the current database time when updates occur.
   * In MySQL, this maps to dynamic trigger updates using onUpdate.
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  /**
   * DeleteDateColumn enables soft-delete patterns in TypeORM.
   * When an entity is soft-deleted, TypeORM sets this field to the deletion time rather than removing the row.
   * This is nullable to indicate that active records are not deleted.
   */
  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;
}
