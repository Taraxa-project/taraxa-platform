import { useState } from 'react';

export const usePagination = (): {
  page: number;
  rowsPerPage: number;
  handleChangePage: (p: number) => void;
  handleChangeRowsPerPage: (l: number) => void;
} => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  const handleChangePage = (p: number) => {
    setPage(p);
  };

  const handleChangeRowsPerPage = (l: number) => {
    setRowsPerPage(l);
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
};
