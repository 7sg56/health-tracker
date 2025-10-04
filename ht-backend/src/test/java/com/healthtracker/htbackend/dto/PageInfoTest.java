package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PageInfoTest {

    @Test
    void testDefaultConstructor() {
        PageInfo pageInfo = new PageInfo();
        
        assertEquals(0, pageInfo.getNumber());
        assertEquals(0, pageInfo.getSize());
        assertEquals(0, pageInfo.getTotalElements());
        assertEquals(0, pageInfo.getTotalPages());
    }

    @Test
    void testConstructorWithParameters() {
        int number = 2;
        int size = 10;
        long totalElements = 45;
        int totalPages = 5;
        
        PageInfo pageInfo = new PageInfo(number, size, totalElements, totalPages);
        
        assertEquals(number, pageInfo.getNumber());
        assertEquals(size, pageInfo.getSize());
        assertEquals(totalElements, pageInfo.getTotalElements());
        assertEquals(totalPages, pageInfo.getTotalPages());
    }

    @Test
    void testGettersAndSetters() {
        PageInfo pageInfo = new PageInfo();
        
        int number = 1;
        int size = 20;
        long totalElements = 100;
        int totalPages = 5;
        
        pageInfo.setNumber(number);
        pageInfo.setSize(size);
        pageInfo.setTotalElements(totalElements);
        pageInfo.setTotalPages(totalPages);
        
        assertEquals(number, pageInfo.getNumber());
        assertEquals(size, pageInfo.getSize());
        assertEquals(totalElements, pageInfo.getTotalElements());
        assertEquals(totalPages, pageInfo.getTotalPages());
    }

    @Test
    void testFirstPage() {
        PageInfo pageInfo = new PageInfo(0, 10, 25, 3);
        
        assertEquals(0, pageInfo.getNumber());
        assertEquals(10, pageInfo.getSize());
        assertEquals(25, pageInfo.getTotalElements());
        assertEquals(3, pageInfo.getTotalPages());
    }

    @Test
    void testLastPage() {
        PageInfo pageInfo = new PageInfo(4, 10, 45, 5);
        
        assertEquals(4, pageInfo.getNumber());
        assertEquals(10, pageInfo.getSize());
        assertEquals(45, pageInfo.getTotalElements());
        assertEquals(5, pageInfo.getTotalPages());
    }

    @Test
    void testEmptyPage() {
        PageInfo pageInfo = new PageInfo(0, 10, 0, 0);
        
        assertEquals(0, pageInfo.getNumber());
        assertEquals(10, pageInfo.getSize());
        assertEquals(0, pageInfo.getTotalElements());
        assertEquals(0, pageInfo.getTotalPages());
    }
}