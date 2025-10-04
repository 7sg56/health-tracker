package com.healthtracker.htbackend.dto;

import java.util.List;

/**
 * Generic paginated response wrapper matching Spring Data Page format
 */
public class PaginatedResponse<T> {
    
    private List<T> content;
    private PageInfo page;
    
    // Default constructor
    public PaginatedResponse() {}
    
    // Constructor with content and page info
    public PaginatedResponse(List<T> content, PageInfo page) {
        this.content = content;
        this.page = page;
    }
    
    // Getters and setters
    public List<T> getContent() {
        return content;
    }
    
    public void setContent(List<T> content) {
        this.content = content;
    }
    
    public PageInfo getPage() {
        return page;
    }
    
    public void setPage(PageInfo page) {
        this.page = page;
    }
}