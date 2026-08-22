package com.spendtracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/home"
    })
    public String frontend() {
        return "forward:/index.html";
    }
}