import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import Footer from "@/components/layout/Footer";
import { ConnectionGuard } from "@/components/layout/ConnectionGuard";
import AgentationToolbar from "@/components/agentation-toolbar";

const geistMonoHeading = Geist_Mono({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pringmoni - Resto POS & Monitoring",
  description: "Sistem manajemen pesanan dan kasir untuk Restoran Pringsewu",
};

const stripExtensionAttrs = `
(function () {
  var attr = "bis_skin_checked";
  var root = document.documentElement;
  if (!root) return;
  function clean(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.hasAttribute && node.hasAttribute(attr)) node.removeAttribute(attr);
    if (node.querySelectorAll) {
      var nodes = node.querySelectorAll("[" + attr + "]");
      for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute(attr);
    }
  }
  clean(root);
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.type === "attributes" && mutation.attributeName === attr) {
        mutation.target.removeAttribute(attr);
      } else if (mutation.addedNodes) {
        for (var j = 0; j < mutation.addedNodes.length; j++) clean(mutation.addedNodes[j]);
      }
    }
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [attr],
  });
  window.addEventListener("load", function () { clean(root); });
  setTimeout(function () { observer.disconnect(); }, 5000);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, geistMonoHeading.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col pb-10">
        <Script
          id="strip-extension-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: stripExtensionAttrs }}
        />
        <Providers>
          <ConnectionGuard />
          {children}
        </Providers>
        <Footer />
        {process.env.NODE_ENV === "development" && <AgentationToolbar />}
      </body>
    </html>
  );
}
