use tauri::{Manager, WindowEvent};

#[tauri::command]
fn hard_reload(window: tauri::Window) {
  window.eval("window.location.reload()").unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .invoke_handler(tauri::generate_handler![hard_reload])
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();
      
      // create menu
      let reload_item = tauri::menu::MenuItemBuilder::new("Hard Reload")
        .id("hard_reload")
        .accelerator("Cmd+Shift+R")
        .build(app)?;
        
      let view_menu = tauri::menu::SubmenuBuilder::new(app, "View")
        .item(&reload_item)
        .build()?;
        
      let menu = tauri::menu::MenuBuilder::new(app)
        .item(&view_menu)
        .build()?;
        
      window.set_menu(menu)?;
      
      window.on_menu_event(|window, event| {
        if event.id() == "hard_reload" {
          window.eval("window.location.reload()").unwrap();
        }
      });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
