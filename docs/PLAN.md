# KrishiBazar: Agricultural Marketplace (C# / ASP.NET Core)

> Ekta online marketplace jekhane desher jekono jelar krishok nijer farm ar fosol dekhiye bikri korte pare, ar kretar jekono jela theke kinte pare. Sathe system dekhay jela-wise daam, daam-er trend (barche/komche), transport bhara, ar mobile banking payment.

---

## 1. Kon Somossha Solve Kore

- Krishok jane na onno jelay fosol-er daam koto
- Kokhon bikri korle labh beshi, seta bujhte pare na
- Dur-er kretar kache pathate bhara koto lagbe, agei jana thake na
- Majhkhane dalal-er karone krishok kom daam pay

---

## 2. User Role

| Role | Ki korte pare |
|---|---|
| **Farmer** | Profile, farm/jomi add, product add, order manage, price trend dekha |
| **Buyer** | Search, farmer profile dekha, transport rent dekha, order ar payment |
| **Admin** | Bajar dor input, vehicle rate thik kora, user/product/category niyontron |

---

## 3. Shob Feature

### A. Farmer Profile ar Farm
- Nam, chhobi, phone, jela, bio
- Ekadhik farm add kora: farm-er nam, jomir poriman (Bigha/Decimal/Acre), main fosol, location, chhobi
- Profile-e farm ar product ek jaygay dekha jay, jate kretar bishwas hoy

### B. Product Management
- Nam, category, daam, poriman, unit, chhobi, kon farm theke
- Available/unavailable toggle

### C. Buyer Experience
- Search ar filter (category, jela, daam range)
- Product details, farmer profile, farm gallery
- Cart, order, order history

### D. Jela-wise Price ar Trend
- Ekoi product kon jelay koto daam, tar tulona (table + chart)
- 7 diner trend: ▲ Rising, ▼ Falling, ● Stable, sathe % poriborton
- 30 diner line chart
- Sohoj poramorsho message ar disclaimer ("eta anumanik trend, guarantee na")

### E. Transport Rent
- Farmer-er jela theke buyer-er jela-r doori (Haversine formula)
- Weight dekhe vehicle suggest: Pickup, Covered van, Truck
- Rent = doori × per-km rate
- Buyer dekhe: Product daam + Transport = Mot

### F. Mobile Banking Payment
- bKash/Nagad/Rocket (sandbox-e shuru; aggregator hole ek integration-e sob)
- Cash on Delivery-o option hishebe thakte pare
- Order status: Pending → Paid → Shipped → Delivered → Completed (Failed/Refunded shoho)

### G. Admin Panel
- Daily/weekly bajar dor input
- Vehicle type ar rate change
- User, product, category management
- Dashboard: total user, order, popular product

---

## 4. Tech Stack

| Ongsho | Technology |
|---|---|
| Backend | C#, ASP.NET Core MVC (ba Web API) |
| Database | SQL Server ba PostgreSQL |
| ORM | Entity Framework Core |
| Auth | ASP.NET Core Identity (role-based) |
| Frontend | Razor, Bootstrap, Chart.js, Leaflet.js |
| Payment | bKash sandbox ba SSLCommerz sandbox |
| Test / Log | xUnit, Serilog |
| Deploy | Azure App Service ba Render |

---

## 5. Folder Structure

```
KrishiBazar/
├── Controllers/    (Account, Farmer, Product, Order, Payment, Price, Admin)
├── Models/
├── ViewModels/
├── Data/           (AppDbContext, SeedData)
├── Services/       (PriceTrendService, TransportService, ImageService, IPaymentGateway)
├── Views/
├── wwwroot/
└── KrishiBazar.Tests/
```

Pore chaile **Clean Architecture** (Domain, Application, Infrastructure, Web) e nite paren.

---

## 6. Database Table

- `Users` (Identity), `FarmerProfiles`, `BuyerProfiles`
- `Districts` (Name, Latitude, Longitude), `Upazilas`
- `Farms` (FarmerProfileId, Name, LandSize, LandUnit, MainCrops, DistrictId, Lat, Lng)
- `FarmImages`
- `ProductCategories`
- `Products` (FarmerProfileId, FarmId?, CategoryId, PricePerUnit, Quantity, Unit, ImageUrl, IsAvailable)
- `PriceHistories` (CategoryId, DistrictId, PricePerKg, Date, Source)
- `VehicleTypes` (Name, RatePerKm, MaxWeightKg)
- `Orders` (BuyerId, ProductCost, TransportCost, Status, Date)
- `OrderItems` (OrderId, ProductId, Quantity, Price)
- `Payments` (OrderId, Amount, Method, TransactionId, Status, CreatedAt)

**Mool relation:**

```
FarmerProfile (1) ── (many) Farm
FarmerProfile (1) ── (many) Product
Farm          (1) ── (many) Product      (optional)
Farm          (1) ── (many) FarmImage
Order         (1) ── (many) OrderItem
Order         (1) ── (1)    Payment
```

---

## 7. Starter Code

### 7.1 Entity Class

```csharp
public class FarmerProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;   // Identity user
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public int DistrictId { get; set; }
    public District District { get; set; } = null!;

    public ICollection<Farm> Farms { get; set; } = new List<Farm>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Farm
{
    public int Id { get; set; }
    public int FarmerProfileId { get; set; }
    public FarmerProfile FarmerProfile { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public decimal LandSize { get; set; }
    public string LandUnit { get; set; } = "Bigha";      // Bigha / Decimal / Acre
    public string? MainCrops { get; set; }
    public string? Description { get; set; }
    public int DistrictId { get; set; }
    public District District { get; set; } = null!;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public ICollection<FarmImage> Images { get; set; } = new List<FarmImage>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class FarmImage
{
    public int Id { get; set; }
    public int FarmId { get; set; }
    public Farm Farm { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
}

public class Product
{
    public int Id { get; set; }
    public int FarmerProfileId { get; set; }
    public FarmerProfile FarmerProfile { get; set; } = null!;
    public int? FarmId { get; set; }
    public Farm? Farm { get; set; }

    public string Name { get; set; } = string.Empty;
    public decimal PricePerUnit { get; set; }
    public decimal QuantityAvailable { get; set; }
    public string Unit { get; set; } = "kg";
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
}
```

### 7.2 Price History ar Trend

```csharp
public class PriceHistory
{
    public int Id { get; set; }
    public int ProductCategoryId { get; set; }
    public ProductCategory ProductCategory { get; set; } = null!;
    public int DistrictId { get; set; }
    public District District { get; set; } = null!;
    public decimal PricePerKg { get; set; }
    public DateTime Date { get; set; }
    public string Source { get; set; } = "Listing";  // Listing / Admin / Market
}

public enum PriceTrend { Rising, Falling, Stable }

public class PriceTrendResult
{
    public decimal CurrentAvg { get; set; }
    public decimal PreviousAvg { get; set; }
    public decimal ChangePercent { get; set; }
    public PriceTrend Trend { get; set; }
}

public class PriceTrendService
{
    private readonly AppDbContext _context;
    public PriceTrendService(AppDbContext context) => _context = context;

    public async Task<PriceTrendResult> GetTrendAsync(int categoryId, int districtId, int days = 7)
    {
        var today = DateTime.UtcNow.Date;
        var recentStart = today.AddDays(-days);
        var previousStart = today.AddDays(-days * 2);

        var recent = await _context.PriceHistories
            .Where(p => p.ProductCategoryId == categoryId
                     && p.DistrictId == districtId
                     && p.Date >= recentStart)
            .AverageAsync(p => (decimal?)p.PricePerKg) ?? 0;

        var previous = await _context.PriceHistories
            .Where(p => p.ProductCategoryId == categoryId
                     && p.DistrictId == districtId
                     && p.Date >= previousStart && p.Date < recentStart)
            .AverageAsync(p => (decimal?)p.PricePerKg) ?? 0;

        decimal change = previous == 0 ? 0 : (recent - previous) / previous * 100;

        return new PriceTrendResult
        {
            CurrentAvg = recent,
            PreviousAvg = previous,
            ChangePercent = Math.Round(change, 1),
            Trend = change > 2 ? PriceTrend.Rising
                  : change < -2 ? PriceTrend.Falling
                  : PriceTrend.Stable
        };
    }
}
```

`±2%` threshold ta nijer moto change korte paren.

### 7.3 Transport Rent (Haversine)

```csharp
public static class GeoHelper
{
    public static double DistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // prithibir byasardho (km)
        double dLat = ToRad(lat2 - lat1);
        double dLon = ToRad(lon2 - lon1);
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                 + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
                 * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;
}

public class VehicleType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal RatePerKm { get; set; }
    public decimal MaxWeightKg { get; set; }
}

public class TransportQuote
{
    public string VehicleName { get; set; } = string.Empty;
    public double DistanceKm { get; set; }
    public decimal Cost { get; set; }
}

public class TransportService
{
    private readonly AppDbContext _context;
    private const double RoadFactor = 1.3; // sidha doori-r cheye rasta shadharonoto beshi, eta anumanik

    public TransportService(AppDbContext context) => _context = context;

    public async Task<TransportQuote?> GetQuoteAsync(int fromDistrictId, int toDistrictId, decimal weightKg)
    {
        var from = await _context.Districts.FindAsync(fromDistrictId);
        var to = await _context.Districts.FindAsync(toDistrictId);
        if (from == null || to == null) return null;

        var vehicle = await _context.VehicleTypes
            .Where(v => v.MaxWeightKg >= weightKg)
            .OrderBy(v => v.MaxWeightKg)
            .FirstOrDefaultAsync();
        if (vehicle == null) return null; // weight onek beshi, ekadhik gari lagbe

        var distance = GeoHelper.DistanceKm(from.Latitude, from.Longitude, to.Latitude, to.Longitude) * RoadFactor;

        return new TransportQuote
        {
            VehicleName = vehicle.Name,
            DistanceKm = Math.Round(distance, 1),
            Cost = Math.Round((decimal)distance * vehicle.RatePerKm, 0)
        };
    }
}
```

`RoadFactor` ar `RatePerKm` admin panel theke change korar bebostha rakhun, hardcode na.

### 7.4 Payment

```csharp
public enum PaymentStatus { Pending, Paid, Failed, Refunded }

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public decimal Amount { get; set; }              // decimal, double na
    public string Method { get; set; } = "COD";      // COD / bKash / SSLCommerz
    public string? TransactionId { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public interface IPaymentGateway
{
    Task<PaymentInitResult> CreatePaymentAsync(Order order, string callbackUrl);
    Task<PaymentVerifyResult> VerifyPaymentAsync(string gatewayPaymentId);
}

public class PaymentInitResult
{
    public bool Success { get; set; }
    public string? GatewayPaymentId { get; set; }
    public string? RedirectUrl { get; set; }
    public string? Error { get; set; }
}

public class PaymentVerifyResult
{
    public bool IsPaid { get; set; }
    public decimal Amount { get; set; }
    public string? TransactionId { get; set; }
}
```

Callback controller:

```csharp
[HttpGet("payment/callback")]
public async Task<IActionResult> Callback(string paymentId, string status)
{
    var payment = await _context.Payments
        .Include(p => p.Order)
        .FirstOrDefaultAsync(p => p.TransactionId == paymentId);
    if (payment == null) return NotFound();

    // idempotency: age-i Paid hole abar process korbo na
    if (payment.Status == PaymentStatus.Paid)
        return RedirectToAction("Success", new { id = payment.OrderId });

    var result = await _gateway.VerifyPaymentAsync(paymentId);

    // gateway-r amount nijer database-er amount-er sathe milao
    if (result.IsPaid && result.Amount == payment.Amount)
    {
        payment.Status = PaymentStatus.Paid;
        payment.Order.Status = OrderStatus.Paid;
    }
    else
    {
        payment.Status = PaymentStatus.Failed;
    }

    await _context.SaveChangesAsync();
    return RedirectToAction(payment.Status == PaymentStatus.Paid ? "Success" : "Failed",
                            new { id = payment.OrderId });
}
```

---

## 8. Payment Flow

```
1. Buyer "Pay" chape
2. Server: Order (Pending) + Payment (Pending) toiri kore
3. Server → Gateway: payment create
4. Gateway payment URL dey, buyer-ke oi URL-e pathano hoy
5. Buyer gateway-r page-e nijer number, OTP, PIN dey (tomar site PIN dekhe na)
6. Gateway buyer-ke tomar Callback URL-e pathay
7. Server gateway-ke abar verify kore (server-side) ar amount milay
8. Sothik hole Payment = Paid, Order = Paid, farmer-ke notification
```

**Order status flow:**

```
Pending → Paid → Shipped → Delivered → Completed
   ↓        ↓
 Failed  Refunded
```

---

## 9. Pages

Home, Login/Register, Product List, Product Details (transport rent shoho), Farmer Profile, Farm Details, Price Comparison, Price Trend, Cart/Checkout, Payment Success/Failed, My Orders, Farmer Dashboard, Add/Edit Farm, Add/Edit Product, Admin Dashboard, Admin Price Entry, Vehicle Rate Settings.

**Farmer Profile page-er layout:**
1. Header: chhobi, nam, jela, bio (phone shudhu login kora buyer-ke)
2. Farm section: prottek farm-er card (nam, jomir poriman, main fosol, chhobi gallery)
3. Product section: oi farmer-er sob product, farm onujayi filter
4. Map: farm-er location pin (Leaflet)
5. Button: "Transport rent dekhun"

---

## 10. Shurokkha ar Shabdhanota

- Password hash (Identity nijei kore), role-based authorization (`[Authorize(Roles = "Farmer")]`)
- Farmer shudhu **nijer** product/farm edit korte parbe, prottek action-e check korun
- Phone ar exact location shudhu login kora buyer-ke, ba order-er por
- Image upload-e file type ar size check
- Payment: server-side verify, idempotency, amount nijer database theke, `decimal` type
- Gateway-r secret key `dotnet user-secrets` ba environment variable-e rakhun, **GitHub-e commit korben na**
- PIN/card kokhono nijer database-e rakhben na
- Prottek payment attempt-er log rakhun (Serilog)
- HTTPS must

---

## 11. Limitation (sotti-ta README-te likhun)

- **Farmer-er payout:** buyer tomar merchant account-e pay korle taka farmer-ke pathanor prosno ashe, ete escrow ar license lagte pare. CV-project-e payout **simulated** rakhun (database-e "Payout Pending/Paid" status) ar likhun je production-e licensed payment partner lagbe. Ain-er bishoye nishchit hote ain-jibi-r poramorsho nin.
- **Daam-er trend** guarantee na, shudhu ager data-r upor bhitti kora anumanik indication.
- **Sandbox** payment-e asol taka jay na.
- **Live merchant account**-er shorto (jemon trade license) bKash/Nagad/aggregator-er official docs theke jene nin.
- **Transport bhara** anumanik: sidha doori × road factor × rate, asol rasta ba gari-r malik-er daam-er theke alada hote pare.

---

## 12. Roadmap (part-time, prai 10 shoptaho)

| Somoy | Kaj |
|---|---|
| Week 1 | Setup, database, Identity role, 64 jela seed |
| Week 2 | Farmer profile + Farm CRUD + image upload |
| Week 3 | Product CRUD, category, farmer profile page |
| Week 4 | Buyer-er product list, search, filter, details |
| Week 5 | Transport rent calculator |
| Week 6 | PriceHistory, trend service, chart |
| Week 7 | Cart, order, status flow |
| Week 8 | Payment: COD + sandbox mobile banking |
| Week 9 | Admin panel, dashboard |
| Week 10 | Test, polish, deploy, README, demo video |

**MVP (prothome eta-i korun):** Farmer product dey → Buyer dekhe → Transport rent dekhay → COD order. Baki sob pore jog korun.

---

## 13. CV-te Kibhabe Likhben

> **KrishiBazar: Agricultural Marketplace** | ASP.NET Core, EF Core, SQL Server
> - Built a role-based marketplace (Farmer/Buyer/Admin) connecting farmers with buyers across all districts of Bangladesh
> - Designed farmer profiles with farm/land details, product listings, and image galleries
> - Implemented district-wise price comparison and 7-day price trend analysis to help farmers choose the best time to sell
> - Developed a transport cost estimator using the Haversine formula and vehicle-type rates
> - Integrated mobile banking payment (bKash/SSLCommerz sandbox) with server-side verification and idempotent callbacks
> - Deployed on Azure; source on GitHub with README, screenshots, and unit tests

---

## 14. Pore Jog Korar Bonus

- ML.NET diye agami 7 diner daam forecast
- Bangla/English duo-bhasha
- SMS/email notification (order confirm, daam-er boro poriborton)
- Farmer rating ar review, verified farmer badge
- OSRM/Google Directions diye asol rasta-r doori

---

## 15. Interview-e Ki Bolben

> "Ami dekhechi je krishok-ra onek somoy fosol-er thik daam pay na, karon tara onno jelar daam jane na ar bikri-r shothik somoy bujhte pare na. Tai ami ekta marketplace baniyechi jekhane daam-er tulona, trend ar transport bhara ek jaygay dekha jay."

Ei golpo-ta recruiter-er mone thake, karon eta shudhu code na, ekta real somossha-r somadhan.
