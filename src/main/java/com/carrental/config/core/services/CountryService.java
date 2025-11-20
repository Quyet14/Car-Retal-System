package com.carrental.config.core.services;

import com.carrental.config.core.interfaces.ICountryService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;

/**
 * Triển khai dịch vụ quản lý quốc gia.
 */
@Service
public class CountryService implements ICountryService {

    private static final Set<String> SUPPORTED_COUNTRIES = Set.of("VIETNAM", "VN", "UNITED STATES");

    @Override
    public List<String> getAllCountries() {
        return List.of("VIETNAM", "UNITED STATES", "CANADA", "JAPAN");
    }

    @Override
    public boolean isValidCountry(String country) {
        return SUPPORTED_COUNTRIES.contains(country.toUpperCase());
    }
}
