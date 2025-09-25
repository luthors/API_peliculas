import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

/**
 * Reusable Data Table Component
 * Provides consistent table functionality across all modules
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  emptyMessage = 'No hay datos disponibles',
}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    }
  };

  const renderCellContent = (row, column) => {
    const value = column.accessor ? row[column.accessor] : '';
    
    // Custom render function
    if (column.render) {
      return column.render(value, row);
    }
    
    // Handle different data types
    switch (column.type) {
      case 'boolean':
        return (
          <Chip
            label={value ? 'Activo' : 'Inactivo'}
            color={value ? 'success' : 'default'}
            size="small"
          />
        );
      
      case 'date':
        return value ? new Date(value).toLocaleDateString('es-ES') : '-';
      
      case 'array':
        return Array.isArray(value) ? value.join(', ') : '-';
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : '-';
      
      case 'url':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            Ver enlace
          </a>
        ) : '-';
      
      default:
        return value || '-';
    }
  };

  const renderActions = (row) => {
    if (!showActions) return null;
    
    return (
      <TableCell align="center">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {onView && (
            <Tooltip title="Ver detalles">
              <IconButton
                size="small"
                color="info"
                onClick={() => onView(row)}
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onEdit && (
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(row)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    minWidth: 120,
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  hover
                  key={row._id || row.id || index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                    >
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {renderActions(row)}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalCount > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}
    </Paper>
  );
};

export default DataTable;