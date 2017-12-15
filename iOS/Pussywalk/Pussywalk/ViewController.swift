//
//  ViewController.swift
//  Pussywalk
//
//  Created by Pall, Zoltan on 05/12/2017.
//  Copyright © 2017 Pussywalk. All rights reserved.
//

import UIKit
import WebKit
import GCDWebServer

class ViewController: UIViewController {

  private let webView: WKWebView
  private let updater: Updater

  required init?(coder aDecoder: NSCoder) {
    self.webView = WKWebView()
    self.updater = Updater()

    super.init(coder: aDecoder)

    self.updater.start()
  }

  override func viewDidLoad() {
    super.viewDidLoad()

    self.initWebServer()

    if #available(iOS 11.0, *) {
      self.webView.scrollView.contentInsetAdjustmentBehavior = .never
    } else {
      // Fallback on earlier versions
    }

    self.webView.translatesAutoresizingMaskIntoConstraints = false
    self.view.addSubview(self.webView)
    self.view.topAnchor.constraint(equalTo: self.webView.topAnchor).isActive = true
    self.view.trailingAnchor.constraint(equalTo: self.webView.trailingAnchor).isActive = true
    self.view.bottomAnchor.constraint(equalTo: self.webView.bottomAnchor).isActive = true
    self.view.leadingAnchor.constraint(equalTo: self.webView.leadingAnchor).isActive = true

    if let url = URL(string: "http://localhost:8080/") {
      let request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
      self.webView.load(request)
    }
  }

  func initWebServer() {

    let webServer = GCDWebServer()
    webServer.addDefaultHandler(forMethod: "GET",
                                request: GCDWebServerRequest.self,
                                processBlock: { (request) -> GCDWebServerResponse? in
                                  let path = self.updater.buildPath + (request.path == "/" ? "/index.html" : request.path)
                                  let fm = FileManager()

                                  if fm.fileExists(atPath: path) {
                                    return GCDWebServerFileResponse(file: path)
                                  } else {
                                    return GCDWebServerErrorResponse(statusCode: 404)
                                  }
    })
    webServer.start(withPort: 8080, bonjourName: "Pussywalk Server")
  }

  override var preferredStatusBarStyle: UIStatusBarStyle {
    return .lightContent
  }

}

