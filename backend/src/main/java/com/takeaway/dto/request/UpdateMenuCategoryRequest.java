package com.takeaway.dto.request;

import lombok.Data;

@Data
public class UpdateMenuCategoryRequest {

    private String name;

    private Integer sortOrder;
}
