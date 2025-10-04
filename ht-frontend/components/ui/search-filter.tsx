'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, Calendar, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFilterState {
  searchQuery: string;
  dateRange: DateRange | null;
  sortBy: string;
  filters: Record<string, string[]>;
}

export interface SearchFilterProps {
  searchPlaceholder?: string;
  sortOptions: SortOption[];
  filterGroups?: {
    key: string;
    label: string;
    options: FilterOption[];
    multiple?: boolean;
  }[];
  dateRangeEnabled?: boolean;
  onStateChange: (state: SearchFilterState) => void;
  className?: string;
  compact?: boolean;
}

const PRESET_DATE_RANGES = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1))
    })
  },
  {
    label: 'Last 7 days',
    value: 'week',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Last 30 days',
    value: 'month',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Last 90 days',
    value: 'quarter',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 90)),
      to: endOfDay(new Date())
    })
  }
];

export function SearchFilter({
  searchPlaceholder = 'Search...',
  sortOptions,
  filterGroups = [],
  dateRangeEnabled = true,
  onStateChange,
  className,
  compact = false
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [sortBy, setSortBy] = useState(sortOptions[0]?.value || '');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  // Emit state changes
  const emitStateChange = useCallback(() => {
    onStateChange({
      searchQuery,
      dateRange,
      sortBy,
      filters
    });
  }, [searchQuery, dateRange, sortBy, filters, onStateChange]);

  // Update state and emit changes
  React.useEffect(() => {
    emitStateChange();
  }, [emitStateChange]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleFilterChange = (groupKey: string, value: string, multiple = false) => {
    setFilters(prev => {
      const currentValues = prev[groupKey] || [];
      
      if (multiple) {
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        return {
          ...prev,
          [groupKey]: newValues
        };
      } else {
        return {
          ...prev,
          [groupKey]: [value]
        };
      }
    });
  };

  const handleDateRangePreset = (preset: string) => {
    const presetRange = PRESET_DATE_RANGES.find(p => p.value === preset);
    if (presetRange) {
      setDateRange(presetRange.getRange());
      setCustomDateFrom('');
      setCustomDateTo('');
    }
  };

  const handleCustomDateRange = () => {
    if (customDateFrom && customDateTo) {
      setDateRange({
        from: new Date(customDateFrom),
        to: new Date(customDateTo)
      });
    }
  };

  const clearDateRange = () => {
    setDateRange(null);
    setCustomDateFrom('');
    setCustomDateTo('');
  };

  const clearFilter = (groupKey: string, value?: string) => {
    setFilters(prev => {
      if (value) {
        return {
          ...prev,
          [groupKey]: (prev[groupKey] || []).filter(v => v !== value)
        };
      } else {
        const newFilters = { ...prev };
        delete newFilters[groupKey];
        return newFilters;
      }
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDateRange(null);
    setFilters({});
    setCustomDateFrom('');
    setCustomDateTo('');
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (dateRange) count++;
    Object.values(filters).forEach(values => {
      count += values.length;
    });
    return count;
  }, [searchQuery, dateRange, filters]);

  const currentSortOption = sortOptions.find(option => option.value === sortBy);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.direction === 'asc' ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          )}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              {dateRangeEnabled && (
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="space-y-2">
                    {PRESET_DATE_RANGES.map((preset) => (
                      <Button
                        key={preset.value}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleDateRangePreset(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        placeholder="From"
                        value={customDateFrom}
                        onChange={(e) => setCustomDateFrom(e.target.value)}
                      />
                      <Input
                        type="date"
                        placeholder="To"
                        value={customDateTo}
                        onChange={(e) => setCustomDateTo(e.target.value)}
                      />
                    </div>
                    {customDateFrom && customDateTo && (
                      <Button size="sm" onClick={handleCustomDateRange}>
                        Apply Custom Range
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Filter Groups */}
              {filterGroups.map((group) => (
                <div key={group.key} className="space-y-2">
                  <Label>{group.label}</Label>
                  <div className="space-y-1">
                    {group.options.map((option) => (
                      <Button
                        key={option.value}
                        variant={
                          (filters[group.key] || []).includes(option.value)
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => handleFilterChange(group.key, option.value, group.multiple)}
                      >
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <Badge variant="secondary">{option.count}</Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search & Filter
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Sort and Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sort */}
          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.direction === 'asc' ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          {dateRangeEnabled && (
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange ? (
                      `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                    ) : (
                      'Select date range'
                    )}
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {PRESET_DATE_RANGES.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleDateRangePreset(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Custom Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="From"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="To"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                        />
                      </div>
                      {customDateFrom && customDateTo && (
                        <Button size="sm" onClick={handleCustomDateRange}>
                          Apply Custom Range
                        </Button>
                      )}
                    </div>
                    {dateRange && (
                      <>
                        <Separator />
                        <Button variant="outline" size="sm" onClick={clearDateRange}>
                          Clear Date Range
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Filter Groups */}
        {filterGroups.length > 0 && (
          <div className="space-y-4">
            {filterGroups.map((group) => (
              <div key={group.key} className="space-y-2">
                <Label>{group.label}</Label>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        (filters[group.key] || []).includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleFilterChange(group.key, option.value, group.multiple)}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <Badge variant="secondary" className="ml-1">
                          {option.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Active Filters</Label>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => handleSearchChange('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {dateRange && (
                <Badge variant="secondary" className="gap-1">
                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0"
                    onClick={clearDateRange}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {Object.entries(filters).map(([groupKey, values]) =>
                values.map((value) => {
                  const group = filterGroups.find(g => g.key === groupKey);
                  const option = group?.options.find(o => o.value === value);
                  return (
                    <Badge key={`${groupKey}-${value}`} variant="secondary" className="gap-1">
                      {group?.label}: {option?.label || value}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => clearFilter(groupKey, value)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}