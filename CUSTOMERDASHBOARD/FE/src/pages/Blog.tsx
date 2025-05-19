import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft } from 'lucide-react';

function Blog() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-1">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
              >
                <ChevronLeft size={24} />
              </button>
              <div
                className="cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img
                  src="/finallogo.png"
                  alt="Drnkly Logo"
                  className="mx-auto object-contain w-32 md:w-48 lg:w-64"
                />
              </div>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="mb-8">
          <img
            src="website.png"
            alt="Blog Hero"
            className="w-full h-auto rounded-2xl shadow-lg object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold mb-8">Peg House Pune: Where Your Favorite Peg Is Just a Click Away</h1>

        <section className="mb-12">
          <p className="text-gray-700 mb-6">
            Let's be honest—nobody enjoys the last-minute booze run. Whether it's a house party, a chill evening, or a "just because" moment, Peg House is here to make your liquor experience smoother than your favorite scotch. From beer home delivery to premium whisky and quirky breezers flavours, we're redefining how Pune drinks.
          </p>
        </section>

        {/* Second Image */}
        <div className="mb-12">
          <img
            src="website2.png"
            alt="Blog Secondary"
            className="w-full h-auto rounded-2xl shadow-lg object-cover"
          />
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Whisky Brands in India with Price List</h2>
          <p className="text-gray-700 mb-4">
            Pune's whisky lovers, rejoice! Peg House offers a wide selection of both Indian and imported whisky brands:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Black and White Whisky (750ml): Available at competitive rates. The Black and White price for 750ml in Pune typically ranges between market standards.</li>
            <li>Black Dog Whiskey: Smooth and bold, the Black Dog whiskey price varies based on label and age.</li>
            <li>We also carry premium whisky in India, blended whisky, and small-size bottles like the 90 ml whisky bottle.</li>
          </ul>
          <p className="text-gray-700 mt-4">
            You can explore all whisky brands and prices directly on Peg House's website.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>liquor online delivery pune • online liquor delivery</p>
            <p>online liquor delivery near me • liquor delivery online</p>
            <p>liquor online delivery near me • online liquor delivery app • liquor online delivery app • order liquor online for delivery</p>
            <p>liquor online delivery pune • how to order liquor delivery online</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Vodka Magic: From Magic Moments to More</h2>
          <p className="text-gray-700 mb-4">
            At Peg House, you'll find an amazing variety of vodka brands. One of the bestsellers? Magic Moments Vodka:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Try Magic Moments White or exotic options like Magic Moments Guava.</li>
            <li>The Magic Moments vodka price in Delhi might differ, but in Pune, we offer it at pocket-friendly rates.</li>
            <li>Looking for something small? Grab a vodka price 250ml variant, or go all in with a vodka full bottle.</li>
            <li>We also feature leading vodka companies in India and international labels.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Breezers & Flavoured Beverages</h2>
          <p className="text-gray-700">
            Craving a light, fruity fix? Peg House stocks all major breezer flavours, including the top-selling breezer cranberry. Whether you need a chill-out essential, it's just a few clicks away.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Order Beer Online in Pune</h2>
          <p className="text-gray-700 mb-4">
            Peg House makes beer online order easy and fast. From mainstream to premium beers in India, our selection covers:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>All beer brands, including domestic and international.</li>
            <li>Light lagers, IPAs, and even scotch beer.</li>
            <li>Enjoy beer home delivery in Pune, and never run out during game night again!</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Explore Rum, Brandy & More</h2>
          <p className="text-gray-700 mb-4">
            Our collection doesn't stop at beer and vodka:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Check the latest white rum price.</li>
            <li>Looking for brandy? We stock top picks like Dr. Brandy and can share the dr brandy price 180 ml in Maharashtra on request.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Pune's Wine Scene with Peg House</h2>
          <p className="text-gray-700 mb-4">
            For wine lovers in Pune, Peg House offers a carefully curated list of labels:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>The popular Sula wine price in India starts around ₹750, with various varietals available.</li>
            <li>We specialize in domestic wine and offer online wine delivery across the city.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How to Order Alcohol Online with Peg House</h2>
          <p className="text-gray-700 mb-4">
            If you've ever wondered how to order alcohol online, Peg House has the answer:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Visit our website or app.</li>
            <li>Choose from categories like whisky online India, vodka online delivery, or buy alcohol online.</li>
            <li>Confirm your location in Pune.</li>
            <li>Sit back as we handle the liquor home delivery.</li>
            <li>We also offer express delivery in select areas.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Trending Alcohol in India</h2>
          <p className="text-gray-700 mb-4">
            Some drinks currently trending across India and available at Peg House include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Soju — Try it now, especially with the rising soju price in Bangalore influencing demand in Pune.</li>
            <li>Japanese whiskey price — For a refined international experience.</li>
            <li>Gin under 2000 — A perfect cocktail base for casual evenings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Why Peg House is Pune's Favorite</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>We're local, we're fast, and we know our liquor.</li>
            <li>Competitive whiskey rates that keep you coming back.</li>
            <li>We keep track of whiskey rates, black and white 750ml price in Mumbai, and yes—even the bacardi price in Kerala (because curiosity matters).</li>
            <li>We serve what's trending, what's premium, and what's uniquely you.</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Peg House: Pouring Happiness in Pune</h2>
          <p className="text-gray-700 mb-4">
            Whether it's a peg, a pint, or a full bottle of celebration, Peg House is where Pune drinks smart. From Magic Moments vodka to Black Dog, from breezers to domestic wine, we've got everything your bar cart dreams of—and we deliver.
          </p>
          <p className="text-gray-700">
            Cheers to great drinks and zero runs to the theka.
          </p>
          <p className="text-gray-700 font-semibold mt-4">
            Order now from Peg House – Pune's homegrown liquor delivery service.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Blog; 