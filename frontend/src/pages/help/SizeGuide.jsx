import { useEffect } from 'react';
import { Ruler } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SizeGuide = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Size Guide</h1>
            <p className="font-body text-muted-foreground">Find your perfect fit with our comprehensive size charts</p>
          </div>

          <div className="space-y-8">
            {/* Sarees */}
            <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border">
              <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
                <Ruler className="text-primary" />
                Sarees
              </h2>
              <p className="font-body text-muted-foreground mb-4">
                Standard saree length: 5.5-6 meters with 0.8 meter blouse piece
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-body">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Size</th>
                      <th className="text-left p-3">Bust (inches)</th>
                      <th className="text-left p-3">Waist (inches)</th>
                      <th className="text-left p-3">Hip (inches)</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="p-3">XS</td>
                      <td className="p-3">30-32</td>
                      <td className="p-3">24-26</td>
                      <td className="p-3">32-34</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">S</td>
                      <td className="p-3">32-34</td>
                      <td className="p-3">26-28</td>
                      <td className="p-3">34-36</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">M</td>
                      <td className="p-3">34-36</td>
                      <td className="p-3">28-30</td>
                      <td className="p-3">36-38</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">L</td>
                      <td className="p-3">36-38</td>
                      <td className="p-3">30-32</td>
                      <td className="p-3">38-40</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">XL</td>
                      <td className="p-3">38-40</td>
                      <td className="p-3">32-34</td>
                      <td className="p-3">40-42</td>
                    </tr>
                    <tr>
                      <td className="p-3">XXL</td>
                      <td className="p-3">40-42</td>
                      <td className="p-3">34-36</td>
                      <td className="p-3">42-44</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lehengas & Suits */}
            <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border">
              <h2 className="font-display text-2xl text-foreground mb-6">Lehengas & Suits</h2>
              <div className="overflow-x-auto">
                <table className="w-full font-body">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Size</th>
                      <th className="text-left p-3">Bust (inches)</th>
                      <th className="text-left p-3">Waist (inches)</th>
                      <th className="text-left p-3">Hip (inches)</th>
                      <th className="text-left p-3">Length (inches)</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="p-3">XS</td>
                      <td className="p-3">30-32</td>
                      <td className="p-3">24-26</td>
                      <td className="p-3">32-34</td>
                      <td className="p-3">38-40</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">S</td>
                      <td className="p-3">32-34</td>
                      <td className="p-3">26-28</td>
                      <td className="p-3">34-36</td>
                      <td className="p-3">40-42</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">M</td>
                      <td className="p-3">34-36</td>
                      <td className="p-3">28-30</td>
                      <td className="p-3">36-38</td>
                      <td className="p-3">42-44</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">L</td>
                      <td className="p-3">36-38</td>
                      <td className="p-3">30-32</td>
                      <td className="p-3">38-40</td>
                      <td className="p-3">44-46</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3">XL</td>
                      <td className="p-3">38-40</td>
                      <td className="p-3">32-34</td>
                      <td className="p-3">40-42</td>
                      <td className="p-3">46-48</td>
                    </tr>
                    <tr>
                      <td className="p-3">XXL</td>
                      <td className="p-3">40-42</td>
                      <td className="p-3">34-36</td>
                      <td className="p-3">42-44</td>
                      <td className="p-3">48-50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Measuring Guide */}
            <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border">
              <h2 className="font-display text-2xl text-foreground mb-6">How to Measure</h2>
              <div className="grid md:grid-cols-3 gap-6 font-body text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Bust</h3>
                  <p className="text-sm">Measure around the fullest part of your bust, keeping the tape horizontal.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Waist</h3>
                  <p className="text-sm">Measure around your natural waistline, keeping the tape comfortably loose.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Hip</h3>
                  <p className="text-sm">Measure around the fullest part of your hips, about 8 inches below your waist.</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary/10 rounded-sm">
                <p className="font-body text-sm text-foreground">
                  <strong>Need help?</strong> Contact our customer support for personalized size recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;
