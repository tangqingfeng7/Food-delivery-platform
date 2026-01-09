package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryDTO {

    private Long id;
    private Long restaurantId;
    private String name;
    private Integer sortOrder;
    private Long itemCount;
}
