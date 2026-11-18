// Countdown VI widgets (WidgetKit). Reads progress the app writes to the
// shared App Group; the countdown / day count is computed locally from the
// fixed launch date, so it stays right even if the app hasn't run today.
// Home Screen widget: free. Lock Screen widgets: Pro (shows an unlock hint
// otherwise). Original text and colours only — no third-party art.
import SwiftUI
import WidgetKit

private let appGroup = "group.com.nickhigh.vicountdown"

private enum Launch {
  static let date: Date = {
    var c = DateComponents()
    c.year = 2026; c.month = 11; c.day = 19; c.hour = 0; c.minute = 0
    return Calendar.current.date(from: c) ?? Date()
  }()

  /// Day 1 = launch day; 0 before launch.
  static func dayNumber(_ now: Date) -> Int {
    if now < date { return 0 }
    let cal = Calendar.current
    let days = cal.dateComponents([.day], from: cal.startOfDay(for: date), to: cal.startOfDay(for: now)).day ?? 0
    return days + 1
  }
}

private struct Palette {
  let bgTop: Color
  let bgBottom: Color
  let accent: Color
  let text: Color
  let muted: Color

  static func named(_ id: String) -> Palette {
    switch id {
    case "sunset": return Palette(bgTop: Color(hex: 0x2a0a2e), bgBottom: Color(hex: 0xff7a3d), accent: Color(hex: 0xffd23d), text: Color(hex: 0xfff6ee), muted: Color(hex: 0xffd9c2))
    case "ocean": return Palette(bgTop: Color(hex: 0x021a2b), bgBottom: Color(hex: 0x0a6b7a), accent: Color(hex: 0x00ffaa), text: Color(hex: 0xeefbff), muted: Color(hex: 0x9cc7d6))
    case "mono": return Palette(bgTop: Color(hex: 0x000000), bgBottom: Color(hex: 0x1a1a1a), accent: Color(hex: 0xffffff), text: Color(hex: 0xffffff), muted: Color(hex: 0x9a9a9a))
    case "gold": return Palette(bgTop: Color(hex: 0x0f0b02), bgBottom: Color(hex: 0x2e210a), accent: Color(hex: 0xf3d27a), text: Color(hex: 0xfff7e0), muted: Color(hex: 0xcdb98a))
    default: return Palette(bgTop: Color(hex: 0x0b0b14), bgBottom: Color(hex: 0x1b1030), accent: Color(hex: 0xff2e88), text: Color(hex: 0xf2f2f8), muted: Color(hex: 0xa7a7bd))
    }
  }
}

private extension Color {
  init(hex: UInt32) {
    self.init(
      red: Double((hex >> 16) & 0xff) / 255.0,
      green: Double((hex >> 8) & 0xff) / 255.0,
      blue: Double(hex & 0xff) / 255.0
    )
  }
}

struct CVIEntry: TimelineEntry {
  let date: Date
  let percent: Int
  let done: Int
  let total: Int
  let tracked: Int
  let pro: Bool
  let theme: String

  static func read(at date: Date) -> CVIEntry {
    let d = UserDefaults(suiteName: appGroup)
    let pro = (d?.integer(forKey: "pro") ?? 0) == 1
    return CVIEntry(
      date: date,
      percent: max(0, min(100, d?.integer(forKey: "percent") ?? 0)),
      done: d?.integer(forKey: "done") ?? 0,
      total: d?.integer(forKey: "total") ?? 0,
      tracked: d?.integer(forKey: "tracked") ?? 0,
      pro: pro,
      theme: pro ? (d?.string(forKey: "theme") ?? "neon") : "neon"
    )
  }

  static let sample = CVIEntry(date: Date(), percent: 42, done: 21, total: 50, tracked: 3, pro: true, theme: "neon")
}

struct CVIProvider: TimelineProvider {
  func placeholder(in context: Context) -> CVIEntry { .sample }

  func getSnapshot(in context: Context, completion: @escaping (CVIEntry) -> Void) {
    completion(context.isPreview ? .sample : .read(at: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<CVIEntry>) -> Void) {
    // One entry now and one at each of the next 3 local midnights, so the
    // day count rolls over without the app running.
    let now = Date()
    var entries = [CVIEntry.read(at: now)]
    let cal = Calendar.current
    var next = cal.startOfDay(for: now)
    for _ in 0..<3 {
      next = cal.date(byAdding: .day, value: 1, to: next) ?? next.addingTimeInterval(86400)
      entries.append(CVIEntry.read(at: next))
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

private struct HeadlineView: View {
  let entry: CVIEntry
  var body: some View {
    let day = Launch.dayNumber(entry.date)
    if day == 0 {
      Text(Launch.date, style: .relative)
    } else {
      Text("Day \(day)")
    }
  }
}

private extension View {
  @ViewBuilder
  func widgetBackground(_ p: Palette) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      self.containerBackground(for: .widget) {
        LinearGradient(colors: [p.bgTop, p.bgBottom], startPoint: .top, endPoint: .bottom)
      }
    } else {
      self.padding().background(LinearGradient(colors: [p.bgTop, p.bgBottom], startPoint: .top, endPoint: .bottom))
    }
  }
}

// MARK: Home Screen (free)

struct HomeWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: CVIEntry

  var body: some View {
    let p = Palette.named(entry.theme)
    VStack(alignment: .leading, spacing: 6) {
      HStack(spacing: 0) {
        Text("COUNTDOWN ").foregroundColor(p.text)
        Text("VI").foregroundColor(p.accent)
      }
      .font(.system(size: 11, weight: .heavy))
      HeadlineView(entry: entry)
        .font(.system(size: family == .systemSmall ? 22 : 26, weight: .black))
        .foregroundColor(p.text)
        .minimumScaleFactor(0.6)
        .lineLimit(1)
      Spacer(minLength: 0)
      if entry.tracked > 0 {
        Text("\(entry.percent)% complete")
          .font(.system(size: 15, weight: .bold))
          .foregroundColor(p.text)
        ProgressView(value: Double(entry.percent), total: 100)
          .tint(p.accent)
        if family != .systemSmall {
          Text("\(entry.done) of \(entry.total) done")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(p.muted)
        }
      } else {
        Text("Set goals in the app to track your 100% run")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(p.muted)
          .lineLimit(3)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetBackground(p)
  }
}

struct HomeWidget: Widget {
  let kind = "CountdownVIHome"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: CVIProvider()) { entry in
      HomeWidgetView(entry: entry)
    }
    .configurationDisplayName("Countdown VI")
    .description("Your 100% progress and day count.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

// MARK: Lock Screen (Pro)

struct LockWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: CVIEntry

  private var inlineLine: String {
    let day = Launch.dayNumber(entry.date)
    return day == 0 ? "VI · \(entry.percent)%" : "VI · Day \(day) · \(entry.percent)%"
  }

  var body: some View {
    Group {
      if !entry.pro {
        switch family {
        case .accessoryCircular:
          ZStack {
            AccessoryWidgetBackground()
            Image(systemName: "lock.fill")
          }
        default:
          Text("Countdown VI Pro unlocks this widget")
        }
      } else {
        switch family {
        case .accessoryCircular:
          Gauge(value: Double(entry.percent), in: 0...100) {
            Text("VI")
          } currentValueLabel: {
            Text("\(entry.percent)%")
          }
          .gaugeStyle(.accessoryCircularCapacity)
        case .accessoryInline:
          Text(inlineLine)
        default:
          VStack(alignment: .leading, spacing: 2) {
            HeadlineView(entry: entry)
              .font(.headline)
            Text(entry.tracked > 0 ? "\(entry.percent)% complete" : "Set goals in the app")
              .font(.caption)
            ProgressView(value: Double(entry.percent), total: 100)
          }
        }
      }
    }
    .widgetAccessoryBackground()
  }
}

private extension View {
  @ViewBuilder
  func widgetAccessoryBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      self.containerBackground(for: .widget) { Color.clear }
    } else {
      self
    }
  }
}

struct LockWidget: Widget {
  let kind = "CountdownVILock"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: CVIProvider()) { entry in
      LockWidgetView(entry: entry)
    }
    .configurationDisplayName("Countdown VI (Lock Screen)")
    .description("Progress ring, day count and percent. Pro.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}

@main
struct CountdownVIWidgets: WidgetBundle {
  var body: some Widget {
    HomeWidget()
    LockWidget()
  }
}
