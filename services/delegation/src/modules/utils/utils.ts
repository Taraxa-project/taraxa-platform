import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';

export async function get<T>(
  httpService: HttpService,
  url: string,
  errorMsg: string,
): Promise<T> {
  return await firstValueFrom(
    httpService
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        map((res) => {
          return res.data;
        }),
        catchError((err, caught) => {
          this.logger.error(`${errorMsg} - Error: ${err}`);
          return caught;
        }),
      ),
  );
}
