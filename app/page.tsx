import HeroSection from '@/components/Herosection';
import ShopByBikes from '@/components/ShopbyBikes';
import HotDeals from '@/components/HotDeals';
import ShopByCategories from '@/components/Categories';
import NewArrivals from '@/components/New Arrivals';
import RecommendedVideos from '@/components/Video';
import AboutUs from '@/components/About';
import Footer from '@/components/Footer';
import TestimonialsServer from '@/components/TestimonialsServer';
import FogLights from '@/components/FogLights';
import CrashGuards from '@/components/CrashGuards';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Shop by Bikes Section */}
      <ShopByBikes />
      
      {/* Hot Deals Section */}
      <HotDeals />
      
      {/* Shop by Categories Section - First 4 */}
      <ShopByCategories limit={4} offset={0} />
      
      {/* Fog Lights Section */}
      <FogLights />
      
      {/* Shop by Categories Section - Next 4 */}
      <ShopByCategories limit={4} offset={4} showTitle={false} />
      
      {/* New Arrivals Section */}
      <NewArrivals />
      
      {/* Shop by Categories Section - Next 4 */}
      <ShopByCategories limit={4} offset={8} showTitle={false} />
      
      {/* Crash Guards Section */}
      <CrashGuards />
      
      {/* Recommended Videos Section */}
      <RecommendedVideos />
      
      {/* Customer Testimonials Section */}
      <TestimonialsServer/>
      
      {/* About Us Section */}
      <AboutUs />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}