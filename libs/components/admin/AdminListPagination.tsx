import React from 'react';
import TablePagination from '@mui/material/TablePagination';

type AdminListPaginationProps = {
	count: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	rowsPerPageOptions?: number[];
};

/** Admin table footer pagination — PawPal pill styling */
export default function AdminListPagination(props: AdminListPaginationProps) {
	const {
		count,
		page,
		rowsPerPage,
		onPageChange,
		onRowsPerPageChange,
		rowsPerPageOptions = [10, 20, 40, 60],
	} = props;

	return (
		<TablePagination
			className="admin-pagination"
			rowsPerPageOptions={rowsPerPageOptions}
			component="div"
			count={count}
			rowsPerPage={rowsPerPage}
			page={page}
			onPageChange={onPageChange}
			onRowsPerPageChange={onRowsPerPageChange}
		/>
	);
}
