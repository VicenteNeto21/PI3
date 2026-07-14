package com.siti.sitiapi.enums;

import lombok.Getter;

@Getter
public enum CNHCategoryEnum {
    A("A"),
    B("B"),
    C("C"),
    D("D"),
    E("E"),
    AB("AB"),
    AC("AC"),
    AD("AD"),
    AE("AE");

    private String category;

    CNHCategoryEnum(String category) {
        this.category = category;
    }
}
