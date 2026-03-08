import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/'],
        },
        sitemap: 'https://notitia.vercel.app/sitemap.xml', // Update this with your actual live URL once deployed
    };
}
