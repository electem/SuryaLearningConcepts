import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.notifications)
  user!: User;

  @Column()
  to!: string;

  @Column({ default: "Notification" })
  subject!: string;

  @Column("text")
  body!: string;

  @Column({ type: "timestamp" })
  sendAt!: Date;

  @Column({ default: false })
  sent!: boolean;

  @Column({ type: "timestamp", nullable: true })
  sentAt!: Date | null;
}
