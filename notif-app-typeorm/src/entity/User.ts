import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Notification } from "./Notification";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications!: Notification[];
}
