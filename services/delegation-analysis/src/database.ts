import chalk from 'chalk';
import { ethers } from 'ethers';
import { Client } from 'pg';
import { DelegationData, UserData } from './types';

export default class PostgresConnector {
  private readonly host;

  private readonly port;

  private readonly user;

  private readonly password;

  private readonly database;

  constructor(host: string, port: number, user: string, password: string, database: string) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.password = password;
    this.database = database;
  }

  public async getDelegationsFromDatabase(): Promise<DelegationData[]> {
    const client = new Client({
      host: this.host,
      port: this.port,
      database: this.database,
      user: this.user,
      password: this.password,
    });
    await client.connect();
    try {
      // Execute a SQL query to retrieve the data
      const res = await client.query(
        `SELECT delegations.user, address, value
         FROM public.delegations
         WHERE delegations."endsAt" is NULL`,
      );

      // Map the rows to objects with user and value fields
      const data = res.rows.map((row) => ({
        user: row.user,
        address: row.address,
        value: ethers.utils.parseEther(`${row.value}`).toString(),
      }));

      console.log(chalk.green(`Read ${data.length} delegation records`));
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error as any);
    }
  }

  public async getUserEmail(address: string): Promise<UserData> {
    const client = new Client({
      host: this.host,
      port: this.port,
      database: this.database,
      user: this.user,
      password: this.password,
    });
    await client.connect();
    try {
      // Execute a SQL query to retrieve the data
      const res = await client.query(
        `SELECT id, email 
        FROM public."users-permissions_user" 
        WHERE lower(eth_wallet) = lower('${address}')`,
      );

      // Map the rows to objects with user and value fields
      const data = res.rows.map((row) => ({
        user: row.id,
        address,
        email: row.email,
      }));

      return data[0];
    } catch (error) {
      console.error(error);
      throw new Error(error as any);
    } finally {
      await client.end();
    }
  }
}
