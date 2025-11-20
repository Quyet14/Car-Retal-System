package com.carrental.config.core.interfaces;

import java.util.List;

public interface ICountryService {
    List<String> getAllCountries();
    boolean isValidCountry(String country);
}
