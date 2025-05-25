import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaFilter, FaSort, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const FilterDropdown = styled.div`
  position: relative;
  min-width: 200px;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
  
  svg {
    margin-left: 8px;
    font-size: 12px;
    color: #6b7280;
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
  
  &:hover {
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #374151;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  &.active {
    background-color: #f3f4f6;
    color: #4f46e5;
    font-weight: 500;
  }
`;

const FilterIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #6b7280;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
`;

const OrderFilters = ({ onFilterChange, onSortChange, onMonthChange }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [activeMonth, setActiveMonth] = useState('Tháng tư 2025');

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const monthRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
      if (monthRef.current && !monthRef.current.contains(event.target)) {
        setMonthOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setFilterOpen(false);
    onFilterChange(filter);
  };

  const handleSortChange = (sort) => {
    setActiveSort(sort);
    setSortOpen(false);
    onSortChange(sort);
  };

  const handleMonthChange = (month) => {
    setActiveMonth(month);
    setMonthOpen(false);
    onMonthChange(month);
  };

  const filters = [
    { id: 'all', label: 'Tất cả đơn hàng' },
    { id: 'delivered', label: 'Đã giao' },
    { id: 'pending', label: 'Chưa giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Mới nhất' },
    { id: 'oldest', label: 'Cũ nhất' },
    { id: 'amount_high', label: 'Tổng tiền: Cao → Thấp' },
    { id: 'amount_low', label: 'Tổng tiền: Thấp → Cao' }
  ];

  const months = [
    'Tháng một 2025',
    'Tháng hai 2025',
    'Tháng ba 2025',
    'Tháng tư 2025',
    'Tháng năm 2025',
    'Tháng sáu 2025'
  ];

  const getFilterLabel = (filterId) => {
    const filter = filters.find(f => f.id === filterId);
    return filter ? filter.label : 'Tất cả đơn hàng';
  };

  const getSortLabel = (sortId) => {
    const sort = sortOptions.find(s => s.id === sortId);
    return sort ? sort.label : 'Mới nhất';
  };

  return (
    <FiltersContainer>
      <FilterDropdown ref={filterRef}>
        <DropdownButton
          onClick={() => setFilterOpen(!filterOpen)}
          isOpen={filterOpen}
        >
          <ButtonContent>
            <FilterIcon>
              <FaFilter />
            </FilterIcon>
            {getFilterLabel(activeFilter)}
          </ButtonContent>
          <FaChevronDown />
        </DropdownButton>

        <AnimatePresence>
          {filterOpen && (
            <DropdownMenu
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filters.map(filter => (
                <MenuItem
                  key={filter.id}
                  className={activeFilter === filter.id ? 'active' : ''}
                  onClick={() => handleFilterChange(filter.id)}
                >
                  {filter.label}
                </MenuItem>
              ))}
            </DropdownMenu>
          )}
        </AnimatePresence>
      </FilterDropdown>

      <FilterDropdown ref={monthRef}>
        <DropdownButton
          onClick={() => setMonthOpen(!monthOpen)}
          isOpen={monthOpen}
        >
          <ButtonContent>
            <FilterIcon>
              <FaCalendarAlt />
            </FilterIcon>
            {activeMonth}
          </ButtonContent>
          <FaChevronDown />
        </DropdownButton>

        <AnimatePresence>
          {monthOpen && (
            <DropdownMenu
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {months.map(month => (
                <MenuItem
                  key={month}
                  className={activeMonth === month ? 'active' : ''}
                  onClick={() => handleMonthChange(month)}
                >
                  {month}
                </MenuItem>
              ))}
            </DropdownMenu>
          )}
        </AnimatePresence>
      </FilterDropdown>

      <FilterDropdown ref={sortRef}>
        <DropdownButton
          onClick={() => setSortOpen(!sortOpen)}
          isOpen={sortOpen}
        >
          <ButtonContent>
            <FilterIcon>
              <FaSort />
            </FilterIcon>
            {getSortLabel(activeSort)}
          </ButtonContent>
          <FaChevronDown />
        </DropdownButton>

        <AnimatePresence>
          {sortOpen && (
            <DropdownMenu
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {sortOptions.map(option => (
                <MenuItem
                  key={option.id}
                  className={activeSort === option.id ? 'active' : ''}
                  onClick={() => handleSortChange(option.id)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </DropdownMenu>
          )}
        </AnimatePresence>
      </FilterDropdown>
    </FiltersContainer>
  );
};

export default OrderFilters; 