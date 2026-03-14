import React, { createContext, useState, useContext, useEffect } from 'react';

const OrganizationContext = createContext();

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};

export const OrganizationProvider = ({ children }) => {
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load organization from localStorage
        const savedOrg = localStorage.getItem('organization');
        if (savedOrg) {
            try {
                setOrganization(JSON.parse(savedOrg));
            } catch (error) {
                console.error('Error parsing organization data:', error);
                localStorage.removeItem('organization');
            }
        }
        setLoading(false);
    }, []);

    const updateOrganization = (orgData) => {
        setOrganization(orgData);
        if (orgData) {
            localStorage.setItem('organization', JSON.stringify(orgData));
        } else {
            localStorage.removeItem('organization');
        }
    };

    const clearOrganization = () => {
        setOrganization(null);
        localStorage.removeItem('organization');
    };

    // Apply organization branding
    useEffect(() => {
        if (organization) {
            const brandColor = organization.brandColor || '#667eea';
            const headerColor = organization.headerColor || '#667eea';

            // Set CSS variables for dynamic theming
            document.documentElement.style.setProperty('--brand-color', brandColor);
            document.documentElement.style.setProperty('--primary-color', brandColor);
            document.documentElement.style.setProperty('--header-color', headerColor);

            // Update primary gradient with brand color
            document.documentElement.style.setProperty(
                '--primary-gradient',
                `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`
            );

            // Update header gradient with header color
            document.documentElement.style.setProperty(
                '--header-gradient',
                `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%)`
            );

            // Update page title
            document.title = `${organization.name} - HRMS`;

            // Update favicon if logo exists
            if (organization.logo) {
                const favicon = document.querySelector("link[rel*='icon']");
                if (favicon) {
                    favicon.href = organization.logo;
                }
            }
        } else {
            // Reset to default
            document.documentElement.style.setProperty('--brand-color', '#667eea');
            document.documentElement.style.setProperty('--primary-color', '#667eea');
            document.documentElement.style.setProperty('--header-color', '#667eea');
            document.documentElement.style.setProperty(
                '--primary-gradient',
                'linear-gradient(135deg, #667eea 0%, #667eeadd 100%)'
            );
            document.documentElement.style.setProperty(
                '--header-gradient',
                'linear-gradient(135deg, #667eea 0%, #667eeadd 100%)'
            );
            document.title = 'Dayflow HRMS';
        }
    }, [organization]);

    const value = {
        organization,
        loading,
        updateOrganization,
        clearOrganization,
        brandColor: organization?.brandColor || '#667eea',
        logo: organization?.logo || null,
        name: organization?.name || 'Dayflow',
        subdomain: organization?.subdomain || null,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};
