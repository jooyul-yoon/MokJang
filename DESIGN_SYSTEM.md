# Design System

```json
{
  "meta": {
    "projectName": "Technicians_App_Clone",
    "designSystemVersion": "1.0.0",
    "style": "Clean, Professional, Trustworthy"
  },
  "theme": {
    "palette": {
      "primary": {
        "main": "#467CFA",
        "light": "#EBF2FF",
        "dark": "#2A5BD9",
        "contrastText": "#FFFFFF"
      },
      "secondary": {
        "main": "#FFCE21",
        "light": "#FFF5CC",
        "dark": "#E6B800",
        "contrastText": "#182236"
      },
      "text": {
        "primary": "#182236",
        "secondary": "#8A94A6",
        "tertiary": "#C4CAD4",
        "disabled": "#E0E3E8"
      },
      "background": {
        "default": "#F7F8FA",
        "paper": "#FFFFFF",
        "input": "#F5F6F8"
      },
      "status": {
        "success": "#4CAF50",
        "error": "#FF5252",
        "info": "#467CFA"
      }
    },
    "typography": {
      "fontFamily": "Noto Sans KR, Pretendard, sans-serif",
      "weights": {
        "regular": 400,
        "medium": 500,
        "bold": 700
      },
      "sizes": {
        "h1": { "fontSize": 26, "lineHeight": 34, "letterSpacing": -0.5 },
        "h2": { "fontSize": 22, "lineHeight": 30, "letterSpacing": -0.5 },
        "h3": { "fontSize": 18, "lineHeight": 26, "letterSpacing": -0.5 },
        "body1": { "fontSize": 16, "lineHeight": 24, "letterSpacing": 0 },
        "body2": { "fontSize": 14, "lineHeight": 20, "letterSpacing": 0 },
        "caption": { "fontSize": 12, "lineHeight": 16, "letterSpacing": 0 },
        "price": { "fontSize": 20, "lineHeight": 28, "fontWeight": 700 }
      }
    },
    "shape": {
      "borderRadius": {
        "sm": 8,
        "md": 12,
        "lg": 20,
        "pill": 100
      }
    },
    "spacing": {
      "xs": 4,
      "sm": 8,
      "md": 16,
      "lg": 24,
      "xl": 32,
      "xxl": 40
    },
    "shadows": {
      "card": "0px 4px 20px rgba(0, 0, 0, 0.05)",
      "floating": "0px 8px 30px rgba(70, 124, 250, 0.3)",
      "navigation": "0px -4px 20px rgba(0, 0, 0, 0.03)"
    }
  },
  "components": {
    "buttons": {
      "primary": {
        "backgroundColor": "#467CFA",
        "color": "#FFFFFF",
        "borderRadius": 12,
        "height": 52
      },
      "secondary": {
        "backgroundColor": "#EBF2FF",
        "color": "#467CFA",
        "borderRadius": 12,
        "height": 52
      },
      "outline": {
        "backgroundColor": "transparent",
        "borderColor": "#E0E3E8",
        "borderWidth": 1,
        "color": "#8A94A6",
        "borderRadius": 12
      }
    },
    "cards": {
      "jobItem": {
        "backgroundColor": "#FFFFFF",
        "borderRadius": 16,
        "padding": 20,
        "shadow": "0px 4px 20px rgba(0, 0, 0, 0.05)"
      },
      "banner": {
        "backgroundColor": "#182236",
        "color": "#FFFFFF",
        "borderRadius": 16
      }
    },
    "tags": {
      "default": {
        "backgroundColor": "#F5F6F8",
        "color": "#8A94A6",
        "borderRadius": 4
      },
      "highlight": {
        "backgroundColor": "#FFF5CC",
        "color": "#E6B800",
        "borderRadius": 4
      }
    },
    "bottomNavigation": {
      "height": 80,
      "backgroundColor": "#FFFFFF",
      "activeColor": "#467CFA",
      "inactiveColor": "#C4CAD4",
      "items": [
        { "id": "home", "label": "HOME", "icon": "home-outline" },
        { "id": "work", "label": "WORK", "icon": "search-list" },
        { "id": "top10", "label": "TOP10", "icon": "medal-outline" },
        { "id": "my", "label": "MY", "icon": "user-outline" }
      ]
    }
  }
}
```
