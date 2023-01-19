import * as fs from 'fs';
import { FormatterOptionsArgs, Row, writeToStream } from '@fast-csv/format';

// https://github.com/C2FO/fast-csv/blob/7e1b174ad1381c253847fe2f263ac7c68d861224/examples/formatting-ts/examples/append.example.ts

type CsvFileOpts = {
  headers: string[];
  path: string;
};

export class CsvFile {
  static write(
    stream: NodeJS.WritableStream,
    rows: Row[],
    options: FormatterOptionsArgs<Row, Row>
  ): Promise<void> {
    return new Promise((res, rej) => {
      writeToStream(stream, rows, options)
        .on('error', (err: Error) => rej(err))
        .on('finish', () => res());
    });
  }

  private readonly headers: string[];

  private readonly path: string;

  private readonly writeOpts: FormatterOptionsArgs<Row, Row>;

  constructor(opts: CsvFileOpts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = {
      headers: this.headers,
      includeEndRowDelimiter: true,
      writeHeaders: true,
    };
  }

  create(rows: Row[]): Promise<void> {
    return CsvFile.write(fs.createWriteStream(this.path), rows, {
      ...this.writeOpts,
    });
  }

  append(rows: Row[]): Promise<void> {
    return CsvFile.write(
      fs.createWriteStream(this.path, { flags: 'a' }),
      rows,
      {
        ...this.writeOpts,
        // dont write the headers when appending
        writeHeaders: false,
      } as FormatterOptionsArgs<Row, Row>
    );
  }

  read(): Promise<Buffer> {
    return new Promise((res, rej) => {
      fs.readFile(this.path, (err, contents) => {
        if (err) {
          return rej(err);
        }
        return res(contents);
      });
    });
  }
}
